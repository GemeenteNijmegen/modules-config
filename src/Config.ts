import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { AWS } from '@gemeentenijmegen/utils';

export class Config {
  private values: Map<string, any>;
  private provider: IConfigProvider;
  constructor(provider?: IConfigProvider) {
    if (!provider) {
      if (!process.env.APP_CONFIG_TABLENAME) {
        throw Error('Config provider or process.env.APP_CONFIG_TABLENAME must be set');
      }
      this.provider = new DynamoDbConfigProvider(process.env.APP_CONFIG_TABLENAME);
    } else {
      this.provider = provider;
    }
    this.values = new Map();
  }

  async get(key: string) {
    let value = this.values.get(key);
    if (!value) {
      value = await this.provider.get(key);
      if (typeof value == 'string' && value.startsWith('arn')) {
        value = await this.retrieveReferencedValue(value);
      } else if (typeof value == 'object' || Array.isArray(value)) {
        value = await this.retrieveNestedReferencedValues(value);
      }
      this.values.set(key, value);
    }
    return value;
  }

  async set(key: string, value: any): Promise<any> {
    return this.provider.set(key, value);
  }

  /**
   * Adds keys if they don't already exist. Used by the CF custom resource for
   * updating the config without overwriting existing configuration.
   *
   * @param initial config object
   */
  async addKeys(initial: Record<string, any>) {
    const keys = Object.keys(initial);
    console.log('Changing config (creating new keys)', keys);
    for (let key of keys) {
      const current = await this.get(key);
      if (!current) {
        await this.set(key, initial[key]);
      }
    }
  }

  async retrieveReferencedValue(arn: string) {
    if (arn.startsWith('arn:aws:secretsmanager:')) {
      return this.provider.getSecret(arn);
    } else if (arn.startsWith('arn:aws:ssm') && arn.includes('parameter')) {
      return this.provider.getParameter(arn);
    }

    // Looks like an arn, but we don't know what kind. Just return the value for the app to handle.
    return arn;
  }

  async retrieveNestedReferencedValues(objectOrArray: object|Array<any>): Promise<object|Array<any>> {
    if (Array.isArray(objectOrArray)) {
      let newArray: any[] = [];
      for (let value of objectOrArray) {
        if (typeof value == 'string') {
          if (value.startsWith('arn')) {
            newArray.push(await this.retrieveReferencedValue(value));
          } else {
            newArray.push(value);
          }
        } else if (typeof value == 'object' || Array.isArray(value)) {
          newArray.push(await this.retrieveNestedReferencedValues(value));
        }
      }
      return newArray;
    } else if (typeof objectOrArray == 'object') {
      const keys = Object.keys(objectOrArray);
      const object = objectOrArray as any;
      for (let property of keys) {
        if (typeof object[property] == 'string') {
          if (object[property].startsWith('arn')) {
            object[property] = await this.retrieveReferencedValue(object[property]);
          }
        } else if (typeof object[property] == 'object' || Array.isArray(typeof object[property])) {
          object[property] = await this.retrieveNestedReferencedValues(object[property]);
        }
      }
      return object;
    } else {
      throw Error(`unexpected parameter type, ${typeof objectOrArray}`);
    }
  }
}

export interface IConfigProvider {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<boolean>;
  getSecret(arn: string): Promise<any>;
  getParameter(arn: string): Promise<any>;
}

class DynamoDbConfigProvider implements IConfigProvider {
  private client: DynamoDBClient;
  constructor(private tableName: string, client?: DynamoDBClient) {
    this.client = client ?? new DynamoDBClient();
  }

  async get(key: string) {
    const input = new GetItemCommand({
      TableName: this.tableName, // required
      Key: {
        pk: {
          S: key,
        },
      },
    });
    const result = await this.client.send(input);
    if (result?.Item?.value?.S) {
      return JSON.parse(result.Item.value.S);
    } else {
      return false;
    }
  }

  async set(key: string, value: any) {
    const input = new PutItemCommand({
      TableName: this.tableName, // required
      Item: {
        pk: {
          S: key,
        },
        value: {
          S: JSON.stringify(value),
        },
      },
    });
    const result = await this.client.send(input);
    if (result.$metadata.httpStatusCode && result.$metadata.httpStatusCode > 299) {
      return false;
    }
    return true;
  }

  async getSecret(arn: string) {
    return AWS.getSecret(arn);
  }

  async getParameter(arn: string) {
    return AWS.getParameter(arn);
  }
}
