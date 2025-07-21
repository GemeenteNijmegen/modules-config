import { CustomResource, RemovalPolicy } from 'aws-cdk-lib';
import { Table, AttributeType, TableEncryption } from 'aws-cdk-lib/aws-dynamodb';
import { IKey } from 'aws-cdk-lib/aws-kms';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { FillTableFunction } from './lambda/fillTable-function';


export interface ConfigProps {
  tableName?: string;
  encrpytionKey?: IKey;
  config: any;
  removalPolicy?: RemovalPolicy;
}

export class ConfigTable extends Construct {
  public table: Table;
  constructor(scope: Construct, id: string, props: ConfigProps) {
    super(scope, id);

    this.table = this.createTable(props);
    this.customFillResource(this.table, props.config, props.removalPolicy);
  }

  private customFillResource(table: Table, config: any, removalPolicy?: RemovalPolicy) {
    const lambda = new FillTableFunction(this, 'fill', {
      environment: {
        APP_CONFIG_TABLENAME: table.tableName,
      },
    });
    this.table.grantReadWriteData(lambda);

    const provider = new Provider(this, 'config-provider', {
      onEventHandler: lambda,
    });

    new CustomResource(this, 'config-resource', {
      serviceToken: provider.serviceToken,
      properties: {
        initialConfig: config,
      },
      removalPolicy,
    });
  }

  private createTable(props: ConfigProps) {
    return new Table(this, 'appConfig', {
      tableName: props.tableName,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      encryptionKey: props.encrpytionKey,
      encryption: props.encrpytionKey ? TableEncryption.CUSTOMER_MANAGED : undefined,
      removalPolicy: props.removalPolicy,
    });
  }
}
