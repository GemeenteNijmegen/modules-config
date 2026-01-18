import { CustomResource, RemovalPolicy } from 'aws-cdk-lib';
import { AttributeType, Table, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { randomUUID } from 'crypto';
import { ConfigSecret } from './ConfigSecret';
import { UpdateConfigFunction } from './lambda/update-config-function';

export interface IConfigProps {
  tableName?: string;
  encryptionKey?: IKey;
  config: any;
  /**
   * @default true
   */
  updateOnEachDeploy?: boolean;
  removalPolicy?: RemovalPolicy;
}

export class LayeredConfigTable extends Construct {
  public table: Table;

  private secrets: Record<string, ISecret> = {};

  constructor(scope: Construct, id: string, props: IConfigProps) {
    super(scope, id);

    this.table = this.createTable(props);
    this.createConfigSecrets(props.config);
    this.customFillResource(this.table, props);
  }

  private createConfigSecrets(config: any) {
    const walk = (obj: any) => {
      if (obj instanceof ConfigSecret) {
        const configSecret = obj;
        const secret = configSecret.createSecret(this);
        this.secrets[configSecret.name] = secret;
      } else if (Array.isArray(obj)) {
        obj.forEach((item) => walk(item));
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([_, value]) => walk(value));
      }
      // Values are ignored
    };
    walk(config);
  }

  findSecret(name: string) {
    return this.secrets[name];
  }

  private customFillResource(table: Table, props: IConfigProps) {
    const lambda = new UpdateConfigFunction(this, 'fill', {
      environment: {
        APP_CONFIG_TABLENAME: table.tableName,
      },
    });
    this.table.grantReadWriteData(lambda);

    const provider = new Provider(this, 'config-provider', {
      onEventHandler: lambda,
    });

    const config = {
      base: {
        "~~": `managed by layerd config table construct (updated on each deployment: ${props.updateOnEachDeploy ? 'true' : 'false'}), to overwrite or add values use override.`,
        ...props.config
      },
      override: {}
    }

    new CustomResource(this, 'config-resource', {
      serviceToken: provider.serviceToken,
      properties: {
        baseConfig: config,
        updateOnEachDeploy: props.updateOnEachDeploy ? randomUUID() : 'false',
      },
      removalPolicy: props.removalPolicy,
    });
  }

  private createTable(props: IConfigProps) {
    return new Table(this, 'appConfig', {
      tableName: props.tableName,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      encryptionKey: props.encryptionKey,
      encryption: props.encryptionKey ? TableEncryption.CUSTOMER_MANAGED : undefined,
      removalPolicy: props.removalPolicy,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
    });
  }
}
