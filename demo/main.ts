import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { App, Aspects, Stack } from 'aws-cdk-lib';
import { ConfigTable } from '../src/Construct/ConfigTableConstruct';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { RetrieveconfigFunction } from './retrieveconfig/retrieveconfig-function';

const app = new App();

const stack = new Stack(app, 'config-test-dev');
Aspects.of(stack).add(new PermissionsBoundaryAspect());

const secret = new Secret(stack, 'secret', { 
  description: 'testsecret'
});

const configTable = new ConfigTable(stack, 'config', {
  config: {
    myKey: 'myvalue2',
    secondkey: ['an', 'array'],
    secret: secret.secretArn
  },
});

const retrieveconfigfunction = new RetrieveconfigFunction(stack, 'demo', {
  environment: {
    APP_CONFIG_TABLENAME: configTable.table.tableName
  },
});
configTable.table.grantReadData(retrieveconfigfunction);
secret.grantRead(retrieveconfigfunction);

app.synth();
