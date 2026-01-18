import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { AWS } from '@gemeentenijmegen/utils';
import { ConfigEntry } from '../ConfigEntry';

const DEFAULT_CONFIG = 'configuration';

export class Config {

  private config: any;
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
  }

  async init() {
    if (this.config) {
      return;
    }
    const storedConfig = await this.provider.get(DEFAULT_CONFIG) as ConfigEntry;
    const merged = this.applyOverrides(storedConfig.base, storedConfig.override);
    this.config = this.insertRuntimeLoaders(merged);
  }

  async store(value: any): Promise<any> {
    return this.provider.set(DEFAULT_CONFIG, value);
  }

  get(): any {
    if (!this.config) {
      throw Error('Config not initialized, please call init() first');
    }
    return this.config;
  }

  private insertRuntimeLoaders(value: any): any {
    // Replace ARN string
    if (this.isArn(value)) {
      console.log('Wrapping', value);
      const x = this.wrapArn(value); // returns RuntimeSecret
      console.log(x);
      return x;
    }

    // Recurse arrays
    if (Array.isArray(value)) {
      return value.map(v => this.insertRuntimeLoaders(v));
    }

    // Recurse plain objects only
    if (this.isObject(value)) {
      const result: any = {};
      for (const [key, v] of Object.entries(value)) {
        result[key] = this.insertRuntimeLoaders(v);
      }
      return result;
    }

    return value;
  }

  private applyOverrides(base: any, override: any): any {

    // Array handling
    if (this.isArrayOfObjectsWithId(base)) {
      if (Array.isArray(override) && override.length > 0) {
        return this.mergeById(base, override);
      }
      // No overrides (undefined or empty array) → still traverse base
      return base.map((v: any) => this.applyOverrides(v, undefined));
    }

    if (Array.isArray(base)) {
      return base.map((v: any, i: number) =>
        this.applyOverrides(v, override?.[i])
      );
    }

    // Object handling
    if (this.isObject(base)) {
      const result: any = { ...base };

      // If override is an object (even empty), merge keys from both
      if (this.isObject(override)) {
        const keys = new Set([
          ...Object.keys(base),
          ...Object.keys(override),
        ]);

        for (const key of keys) {
          result[key] = this.applyOverrides(base[key], override[key]);
        }

        return result;
      }

      // No override object → still recurse into base
      for (const key of Object.keys(base)) {
        result[key] = this.applyOverrides(base[key], undefined);
      }

      return result;
    }

    // Primitive fallback
    return override !== undefined ? override : base;
  }

  private mergeById<T extends { id: string }>(
    base: T[],
    override: Partial<T>[]
  ): T[] {
    const map = new Map(base.map(x => [x.id, { ...x }]));

    for (const o of override) {
      if (!o.id) {
        throw Error('objects in override array must have an id property!');
      }
      const existing = map.get(o.id) ?? { id: o.id } as T;
      map.set(o.id, this.applyOverrides(existing, o));
    }

    return Array.from(map.values());
  }

  private isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private isArn(value: unknown): value is string {
    return typeof value === 'string' && value.startsWith('arn:');
  }

  private isArrayOfObjectsWithId(value: unknown): value is Array<{ id: string }> {
    return (
      Array.isArray(value) &&
      (value.length === 0 ||
        value.every(
          v =>
            typeof v === 'object' &&
            v !== null &&
            !Array.isArray(v) &&
            typeof (v as any).id === 'string'
        ))
    );
  }

  wrapArn(arn: string) {
    if (arn.startsWith('arn:aws:secretsmanager:')) {
      return new RuntimeLoader(arn, 'secret', this.provider);
    } else if (arn.startsWith('arn:aws:ssm') && arn.includes('parameter')) {
      return new RuntimeLoader(arn, 'parameter', this.provider);
    }
    // Looks like an arn, but we don't know what kind. Just return the value for the app to handle.
    return arn;
  }

}

export class RuntimeLoader {
  private value: undefined | string;
  constructor(
    public readonly arn: string,
    public readonly type: 'secret' | 'parameter',
    private readonly provider: IConfigProvider,
  ) { }
  async getValue() {
    if (!this.value) {
      if (this.type == 'secret') {
        this.value = await this.provider.getSecret(this.arn);
      }
      if (this.type == 'parameter') {
        this.value = await this.provider.getParameter(this.arn);
      }
    }
    return this.value;
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
