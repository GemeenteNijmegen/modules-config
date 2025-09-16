# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ConfigTable <a name="ConfigTable" id="@gemeentenijmegen/config.ConfigTable"></a>

#### Initializers <a name="Initializers" id="@gemeentenijmegen/config.ConfigTable.Initializer"></a>

```typescript
import { ConfigTable } from '@gemeentenijmegen/config'

new ConfigTable(scope: Construct, id: string, props: IConfigProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.Initializer.parameter.props">props</a></code> | <code><a href="#@gemeentenijmegen/config.IConfigProps">IConfigProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@gemeentenijmegen/config.ConfigTable.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@gemeentenijmegen/config.ConfigTable.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@gemeentenijmegen/config.ConfigTable.Initializer.parameter.props"></a>

- *Type:* <a href="#@gemeentenijmegen/config.IConfigProps">IConfigProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@gemeentenijmegen/config.ConfigTable.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@gemeentenijmegen/config.ConfigTable.isConstruct"></a>

```typescript
import { ConfigTable } from '@gemeentenijmegen/config'

ConfigTable.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@gemeentenijmegen/config.ConfigTable.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@gemeentenijmegen/config.ConfigTable.property.table">table</a></code> | <code>aws-cdk-lib.aws_dynamodb.Table</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="@gemeentenijmegen/config.ConfigTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `table`<sup>Required</sup> <a name="table" id="@gemeentenijmegen/config.ConfigTable.property.table"></a>

```typescript
public readonly table: Table;
```

- *Type:* aws-cdk-lib.aws_dynamodb.Table

---



## Classes <a name="Classes" id="Classes"></a>

### Config <a name="Config" id="@gemeentenijmegen/config.Config"></a>

#### Initializers <a name="Initializers" id="@gemeentenijmegen/config.Config.Initializer"></a>

```typescript
import { Config } from '@gemeentenijmegen/config'

new Config(provider?: IConfigProvider)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gemeentenijmegen/config.Config.Initializer.parameter.provider">provider</a></code> | <code><a href="#@gemeentenijmegen/config.IConfigProvider">IConfigProvider</a></code> | *No description.* |

---

##### `provider`<sup>Optional</sup> <a name="provider" id="@gemeentenijmegen/config.Config.Initializer.parameter.provider"></a>

- *Type:* <a href="#@gemeentenijmegen/config.IConfigProvider">IConfigProvider</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gemeentenijmegen/config.Config.addKeys">addKeys</a></code> | Adds keys if they don't already exist. |
| <code><a href="#@gemeentenijmegen/config.Config.get">get</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.Config.retrieveNestedReferencedValues">retrieveNestedReferencedValues</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.Config.retrieveReferencedValue">retrieveReferencedValue</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.Config.set">set</a></code> | *No description.* |

---

##### `addKeys` <a name="addKeys" id="@gemeentenijmegen/config.Config.addKeys"></a>

```typescript
public addKeys(initial: {[ key: string ]: any}): void
```

Adds keys if they don't already exist.

Used by the CF custom resource for
updating the config without overwriting existing configuration.

###### `initial`<sup>Required</sup> <a name="initial" id="@gemeentenijmegen/config.Config.addKeys.parameter.initial"></a>

- *Type:* {[ key: string ]: any}

config object.

---

##### `get` <a name="get" id="@gemeentenijmegen/config.Config.get"></a>

```typescript
public get(key: string): any
```

###### `key`<sup>Required</sup> <a name="key" id="@gemeentenijmegen/config.Config.get.parameter.key"></a>

- *Type:* string

---

##### `retrieveNestedReferencedValues` <a name="retrieveNestedReferencedValues" id="@gemeentenijmegen/config.Config.retrieveNestedReferencedValues"></a>

```typescript
public retrieveNestedReferencedValues(objectOrArray: object | any[]): object | any[]
```

###### `objectOrArray`<sup>Required</sup> <a name="objectOrArray" id="@gemeentenijmegen/config.Config.retrieveNestedReferencedValues.parameter.objectOrArray"></a>

- *Type:* object | any[]

---

##### `retrieveReferencedValue` <a name="retrieveReferencedValue" id="@gemeentenijmegen/config.Config.retrieveReferencedValue"></a>

```typescript
public retrieveReferencedValue(arn: string): any
```

###### `arn`<sup>Required</sup> <a name="arn" id="@gemeentenijmegen/config.Config.retrieveReferencedValue.parameter.arn"></a>

- *Type:* string

---

##### `set` <a name="set" id="@gemeentenijmegen/config.Config.set"></a>

```typescript
public set(key: string, value: any): any
```

###### `key`<sup>Required</sup> <a name="key" id="@gemeentenijmegen/config.Config.set.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@gemeentenijmegen/config.Config.set.parameter.value"></a>

- *Type:* any

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IConfigProps <a name="IConfigProps" id="@gemeentenijmegen/config.IConfigProps"></a>

- *Implemented By:* <a href="#@gemeentenijmegen/config.IConfigProps">IConfigProps</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@gemeentenijmegen/config.IConfigProps.property.config">config</a></code> | <code>any</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProps.property.tableName">tableName</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProps.property.updatePolicy">updatePolicy</a></code> | <code>string</code> | Policy for updates: - Add (default): Only keys not yet present in the config will be added - Ignore: Updates have no effect on the stored config object. |

---

##### `config`<sup>Required</sup> <a name="config" id="@gemeentenijmegen/config.IConfigProps.property.config"></a>

```typescript
public readonly config: any;
```

- *Type:* any

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@gemeentenijmegen/config.IConfigProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="@gemeentenijmegen/config.IConfigProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `tableName`<sup>Optional</sup> <a name="tableName" id="@gemeentenijmegen/config.IConfigProps.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

---

##### `updatePolicy`<sup>Optional</sup> <a name="updatePolicy" id="@gemeentenijmegen/config.IConfigProps.property.updatePolicy"></a>

```typescript
public readonly updatePolicy: string;
```

- *Type:* string

Policy for updates: - Add (default): Only keys not yet present in the config will be added - Ignore: Updates have no effect on the stored config object.

---

### IConfigProvider <a name="IConfigProvider" id="@gemeentenijmegen/config.IConfigProvider"></a>

- *Implemented By:* <a href="#@gemeentenijmegen/config.IConfigProvider">IConfigProvider</a>

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@gemeentenijmegen/config.IConfigProvider.get">get</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProvider.getParameter">getParameter</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProvider.getSecret">getSecret</a></code> | *No description.* |
| <code><a href="#@gemeentenijmegen/config.IConfigProvider.set">set</a></code> | *No description.* |

---

##### `get` <a name="get" id="@gemeentenijmegen/config.IConfigProvider.get"></a>

```typescript
public get(key: string): any
```

###### `key`<sup>Required</sup> <a name="key" id="@gemeentenijmegen/config.IConfigProvider.get.parameter.key"></a>

- *Type:* string

---

##### `getParameter` <a name="getParameter" id="@gemeentenijmegen/config.IConfigProvider.getParameter"></a>

```typescript
public getParameter(arn: string): any
```

###### `arn`<sup>Required</sup> <a name="arn" id="@gemeentenijmegen/config.IConfigProvider.getParameter.parameter.arn"></a>

- *Type:* string

---

##### `getSecret` <a name="getSecret" id="@gemeentenijmegen/config.IConfigProvider.getSecret"></a>

```typescript
public getSecret(arn: string): any
```

###### `arn`<sup>Required</sup> <a name="arn" id="@gemeentenijmegen/config.IConfigProvider.getSecret.parameter.arn"></a>

- *Type:* string

---

##### `set` <a name="set" id="@gemeentenijmegen/config.IConfigProvider.set"></a>

```typescript
public set(key: string, value: any): boolean
```

###### `key`<sup>Required</sup> <a name="key" id="@gemeentenijmegen/config.IConfigProvider.set.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@gemeentenijmegen/config.IConfigProvider.set.parameter.value"></a>

- *Type:* any

---


