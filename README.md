# Config

Helpers for doing application config. The package includes a construct which
creates (by default) a DynamoDB table for storing configuration, which can be 
provided an initial configuration.

Additionally, a runtime Config typescript-class is provided, which can retrieve config
from a backend (currently, only dynamodb is supported). The config class can 
retrieve configuration by key, an JSON-compatible value is supported. Any config
values which are aws Secrets Manager secret ARNs, or SSM parameter ARNs, will be
retrieved and return the value. For this, the calling code must have access to 
the parameter/secret. Nested arns work as well.

## Example usage

See demo/main.ts for a basic example. Using the construct:

```
import { ConfigTable } from '@gemeentenijmegen/aws-config/construct';
const configTable = new ConfigTable(scope, 'config', {
  config: {
    myKey: 'myvalue2',
    anArrayKey: ['an', 'array'],
    secret: 'arn:aws:secretsmanager:us-west-2:123456789012:secret:my-path/my-secret-name-1a2b3c',
    nested: {
      objects: {
        withParameter: 'arn:aws:ssm:region:account-id:parameter/parameter-name'
      }
    }
  },
});
```

Using the runtime code:

```
import { Config } from '@gemeentenijmegen/aws-config/config';
const config = new Config();
await config.get('myKey'); // 'myvalue2'
await config.get('secret'); // secret value from provided arn
```

By default, the runtime `Config()` call will use the dynamodb-backend, and look
for the table in `process.env.APP_CONFIG_TABLENAME`. To use a different table,
inject a ConfigProvider:

```
new Config(new DynamoDbConfigProvider('myConfigTableName'));
```
