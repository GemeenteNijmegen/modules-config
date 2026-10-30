# Layered configuration

Status: proposed design. Not available in the package yet.

This document describes a way to keep the config in DynamoDB in sync with the
config in CDK, while still allowing manual changes in the AWS console.

## Problem

`ConfigTable` writes the config from CDK to DynamoDB on the first deploy. On
later deploys the behaviour depends on `updatePolicy`:

- `add` (default): top-level keys that are not in the table yet are added.
  Existing keys are left alone.
- `ignore`: nothing happens.

As a result:

- Changing an existing value in CDK has no effect on the table.
- Changing a nested value has no effect, because only top-level keys are checked.
- Removing a key in CDK leaves it in the table.
- You can't tell whether a value in the table came from CDK or was edited by hand.

The CDK code is therefore not the source of truth, and the deployed config
drifts from it.

## Two layers

Each config item is stored as two layers:

| Layer      | Owner     | Written by                              | Lifecycle                        |
| ---------- | --------- | --------------------------------------- | -------------------------------- |
| `base`     | CDK code  | The custom resource, on every deploy    | Fully replaced; never edit by hand |
| `override` | Operators | People, in the console or with scripts  | Never touched by a deploy        |

```
effective config = merge(base, override)
```

CDK always wins for `base`, people always win for `override`, and a deploy
never removes manual changes. Removing a key from CDK removes it from `base`.
It only stays in the effective config if it is also set in `override`.

The layered behaviour is opt-in with `updatePolicy: 'layered'`. Without it,
the construct and its template stay the same.

## Storage

The table keeps one item per top-level key, as it does today. In layered mode
an item has these attributes:

| Attribute   | Type           | Written by | Description                                                    |
| ----------- | -------------- | ---------- | -------------------------------------------------------------- |
| `pk`        | String         | -          | The top-level key                                              |
| `value`     | String (JSON)  | Lambda     | `merge(base, override)`. This is what the runtime reads.       |
| `base`      | Map            | Lambda     | The config from CDK. Do not edit by hand.                      |
| `override`  | Map            | Operators  | Manual changes. Edit this in the console (JSON view).          |
| `revision`  | Number         | Lambda     | Prevents two lambdas from overwriting each other's writes      |
| `managedBy` | String         | Lambda     | A note for people in the console: edit `override` only         |

`base` and `override` are native DynamoDB maps, so they are readable and
editable in the console's JSON view. `value` stays a JSON string, so the
runtime (`await config.get('key')`) and older versions of this package keep
working without changes.

An item that has a `value` but no `base` was written before layered mode was
enabled. This document calls it a legacy item.

## Merge rules

`merge(base, override)` is applied recursively:

| `base`                         | `override`                     | Result                                                 |
| ------------------------------ | ------------------------------ | ------------------------------------------------------ |
| anything                       | `undefined`                    | `base`                                                 |
| object                         | object                         | union of keys, each key merged recursively             |
| array of objects with an `id`  | array of objects with an `id`  | merged by `id`; items with a new `id` are appended      |
| any other array                | array                          | `override` replaces the whole array                    |
| primitive                      | anything                       | `override`                                             |
| object or array                | a different type               | `override` wins, and a warning is logged               |

Examples:

```jsonc
// object merge
base:     { "api": { "url": "https://example.com", "timeout": 10 } }
override: { "api": { "timeout": 30 } }
result:   { "api": { "url": "https://example.com", "timeout": 30 } }

// array merge by id
base:     { "clients": [{ "id": "a", "enabled": true }] }
override: { "clients": [{ "id": "a", "enabled": false }, { "id": "b", "enabled": true }] }
result:   { "clients": [{ "id": "a", "enabled": false }, { "id": "b", "enabled": true }] }
```

Consequences:

- An override can change and add values, but can't remove a key from `base`.
  To blank a value, override it with `null`.
- Arrays that should be overridable per item need a stable `id` on each item.

`diff(effective, base)` is the inverse of `merge`: the smallest `override`
for which `merge(base, override)` equals `effective`. It is used to migrate
legacy items. A key that is in `base` but not in `effective` can't be
expressed as an override; the migration logs that case.

## Deploy

In layered mode the custom resource gets the whole config as one JSON string
(`Stack.toJsonString(config)`). CloudFormation turns plain property values
into strings, so `1` would arrive as `"1"`. One JSON string keeps the types
and resolves tokens such as secret ARNs.

On `Create` and `Update`, the lambda reads all items in the table and then,
for each top-level key in the CDK config:

- **No item yet.** Write `base` and `value`, with an empty `override`.
- **Legacy item.** Set `base` to the CDK value and `override` to
  `diff(oldValue, base)`, then recompute `value`. The effective config stays
  exactly what it was, and the derived override is logged.
- **Layered item.** Replace `base` and recompute `value`. Leave `override`
  untouched.

For each item whose key is no longer in the CDK config:

- **Legacy item.** Set `override` to its `value`, so nothing disappears.
- **Layered item.** Remove `base` and recompute `value` from `override`. If
  `override` is empty too, delete the item.

On `Delete`, nothing happens.

## Manual changes

In layered mode the table has a DynamoDB stream. A second lambda listens to
it and recomputes `value` when `base` or `override` changes, so a manual edit
of `override` applies within seconds instead of on the next deploy.

That lambda only writes `value` and `revision`, so its own write doesn't
trigger another recompute. Both lambdas write conditionally on `revision`,
so a deploy and a manual edit at the same moment can't overwrite each other.

## Secrets and parameters

Config values can be declared as secrets or SSM parameters:

```ts
new ConfigTable(this, 'config', {
  updatePolicy: 'layered',
  config: {
    notify: {
      // Created by the construct, retained on stack deletion
      token: ConfigParameter.secret({ id: 'notify-token', path: '/esf/notify-token', description: 'NotifyNL API key' }),
      issuer: ConfigParameter.ssm({ id: 'notify-issuer', path: '/esf/notify-issuer', description: 'NotifyNL issuer', defaultValue: '-' }),
      // Existing resources, only referenced
      objectsToken: ConfigParameter.fromSecretName('/esf/objects-token'),
    },
  },
});
```

At synth time the construct replaces each `ConfigParameter` by the ARN of its
secret or parameter. The runtime already resolves ARNs to their values. The
construct ID comes from `id`, not from the position in the config, so
reordering the config never replaces a secret.

`configTable.grantRead(lambda)` grants read access to the table (and its KMS
key), to every secret and parameter declared this way, and sets the
`APP_CONFIG_TABLENAME` environment variable. ARNs that are only set in
`override` are not known to CDK and need their own grant.

## Compatibility and rollback

- The runtime is unchanged: it reads `value`, which has the same format as
  today.
- Switching an existing table to layered mode migrates it on the first
  deploy, without changing the effective config.
- Rolling back is safe. With `updatePolicy` set back to `add`, or with an
  older package version, every key already has a `value`, so the deploy does
  nothing. Older runtimes keep reading `value`.

## Limitations

- An override can't remove a key or array item from `base`.
- Arrays without an `id` on their items can only be overridden as a whole.
- Each DynamoDB item is limited to 400 KB, which includes `value`, `base` and
  `override` together.
- `override` is not validated. A wrong shape only shows up when the
  application reads the config.
