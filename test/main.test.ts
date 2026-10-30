import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Key } from 'aws-cdk-lib/aws-kms';
import { ConfigTable } from '../src/Construct/ConfigTableConstruct';

// These tests pin the template that existing consumers deploy. Explicit assertions
// instead of snapshots, because `projen test` runs jest with --updateSnapshot.
describe('ConfigTable template', () => {
  const tableArn = { 'Fn::GetAtt': [Match.stringLikeRegexp('^configappConfig'), 'Arn'] };

  test('with default props', () => {
    const stack = new Stack();
    new ConfigTable(stack, 'config', {
      config: {
        myKey: 'myvalue',
        nested: { number: 1, flag: true, list: ['a', 'b'] },
      },
    });
    const template = Template.fromStack(stack);

    expect(Object.keys(template.toJSON().Resources)).toHaveLength(8);
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.resourceCountIs('AWS::IAM::Role', 2);
    template.resourceCountIs('AWS::IAM::Policy', 2);
    template.resourceCountIs('AWS::Lambda::Function', 2);
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);

    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
      Properties: Match.exact({
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }),
    });

    template.hasResource('AWS::CloudFormation::CustomResource', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
      Properties: Match.exact({
        ServiceToken: { 'Fn::GetAtt': [Match.stringLikeRegexp('^configconfigproviderframeworkonEvent'), 'Arn'] },
        initialConfig: {
          myKey: 'myvalue',
          nested: { number: 1, flag: true, list: ['a', 'b'] },
        },
        updatePolicy: 'add',
      }),
    });

    template.hasResourceProperties('AWS::Lambda::Function', {
      Description: 'src/Construct/lambda/fillTable.lambda.ts',
      Handler: 'index.handler',
      Runtime: 'nodejs24.x',
      Environment: {
        Variables: Match.exact({
          APP_CONFIG_TABLENAME: { Ref: Match.stringLikeRegexp('^configappConfig') },
          AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        }),
      },
    });

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyName: Match.stringLikeRegexp('^configfillServiceRoleDefaultPolicy'),
      PolicyDocument: Match.exact({
        Version: '2012-10-17',
        Statement: [
          {
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:Query',
              'dynamodb:GetItem',
              'dynamodb:Scan',
              'dynamodb:ConditionCheckItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
              'dynamodb:DescribeTable',
            ],
            Effect: 'Allow',
            Resource: tableArn,
          },
          {
            Action: ['dynamodb:GetRecords', 'dynamodb:GetShardIterator'],
            Effect: 'Allow',
            Resource: tableArn,
          },
        ],
      }),
    });
  });

  test('with all props set', () => {
    const stack = new Stack();
    const encryptionKey = new Key(stack, 'key');
    new ConfigTable(stack, 'config', {
      config: { myKey: 'myvalue' },
      tableName: 'my-config',
      encryptionKey,
      updatePolicy: 'ignore',
      removalPolicy: RemovalPolicy.DESTROY,
    });
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DynamoDB::Table', 1);
    template.resourceCountIs('AWS::KMS::Key', 1);
    template.resourceCountIs('AWS::CloudFormation::CustomResource', 1);

    template.hasResource('AWS::DynamoDB::Table', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
      Properties: Match.exact({
        TableName: 'my-config',
        AttributeDefinitions: [{ AttributeName: 'pk', AttributeType: 'S' }],
        KeySchema: [{ AttributeName: 'pk', KeyType: 'HASH' }],
        PointInTimeRecoverySpecification: { PointInTimeRecoveryEnabled: true },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        SSESpecification: {
          KMSMasterKeyId: { 'Fn::GetAtt': [Match.stringLikeRegexp('^key'), 'Arn'] },
          SSEEnabled: true,
          SSEType: 'KMS',
        },
      }),
    });

    template.hasResource('AWS::CloudFormation::CustomResource', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
      Properties: Match.exact({
        ServiceToken: { 'Fn::GetAtt': [Match.stringLikeRegexp('^configconfigproviderframeworkonEvent'), 'Arn'] },
        initialConfig: { myKey: 'myvalue' },
        updatePolicy: 'ignore',
      }),
    });

    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyName: Match.stringLikeRegexp('^configfillServiceRoleDefaultPolicy'),
      PolicyDocument: {
        Statement: Match.arrayWith([
          {
            Action: ['kms:Decrypt', 'kms:DescribeKey', 'kms:Encrypt', 'kms:ReEncrypt*', 'kms:GenerateDataKey*'],
            Effect: 'Allow',
            Resource: { 'Fn::GetAtt': [Match.stringLikeRegexp('^key'), 'Arn'] },
          },
        ]),
      },
    });
  });
});
