import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { CdkCustomResourceEvent } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import { handler } from '../src/Construct/lambda/fillTable.lambda';

const dynamo = mockClient(DynamoDBClient);

function event(requestType: 'Create' | 'Update' | 'Delete', properties: Record<string, any>): CdkCustomResourceEvent {
  return {
    RequestType: requestType,
    ServiceToken: 'token',
    ResponseURL: 'https://example.com',
    StackId: 'stack',
    RequestId: 'request',
    LogicalResourceId: 'config',
    PhysicalResourceId: 'config',
    ResourceType: 'Custom::Config',
    ResourceProperties: { ServiceToken: 'token', ...properties },
    OldResourceProperties: { ServiceToken: 'token' },
  } as CdkCustomResourceEvent;
}

function storedItems() {
  return dynamo.commandCalls(PutItemCommand).map(call => call.args[0].input.Item);
}

beforeAll(() => {
  process.env.APP_CONFIG_TABLENAME = 'config-table';
  jest.spyOn(console, 'debug').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

beforeEach(() => {
  dynamo.reset();
  dynamo.on(PutItemCommand).resolves({ $metadata: { httpStatusCode: 200 } });
});

describe('fillTable handler', () => {
  test('Create writes every top-level key as a JSON string', async() => {
    await handler(event('Create', {
      initialConfig: { myKey: 'myvalue', nested: { list: [{ id: 'a' }] } },
      updatePolicy: 'add',
    }));

    expect(dynamo.commandCalls(PutItemCommand).every(call => call.args[0].input.TableName === 'config-table')).toBe(true);
    expect(storedItems()).toEqual(expect.arrayContaining([
      { pk: { S: 'myKey' }, value: { S: '"myvalue"' } },
      { pk: { S: 'nested' }, value: { S: '{"list":[{"id":"a"}]}' } },
    ]));
    expect(storedItems()).toHaveLength(2);
    expect(dynamo.commandCalls(GetItemCommand)).toHaveLength(0);
  });

  test('Update with policy add only writes keys that are not stored yet', async() => {
    dynamo.on(GetItemCommand, { Key: { pk: { S: 'existing' } } })
      .resolves({ Item: { pk: { S: 'existing' }, value: { S: '{"a":"manual"}' } } });
    dynamo.on(GetItemCommand, { Key: { pk: { S: 'missing' } } }).resolves({});

    await handler(event('Update', {
      initialConfig: { existing: { a: 'from-cdk', b: 'new-nested-key' }, missing: 'new' },
      updatePolicy: 'add',
    }));

    expect(dynamo.commandCalls(GetItemCommand).map(call => call.args[0].input)).toEqual([
      { TableName: 'config-table', Key: { pk: { S: 'existing' } } },
      { TableName: 'config-table', Key: { pk: { S: 'missing' } } },
    ]);
    expect(storedItems()).toEqual([
      { pk: { S: 'missing' }, value: { S: '"new"' } },
    ]);
  });

  test('Update with policy ignore does not touch the table', async() => {
    await handler(event('Update', {
      initialConfig: { myKey: 'myvalue' },
      updatePolicy: 'ignore',
    }));

    expect(dynamo.calls()).toHaveLength(0);
  });

  test('Update with an unknown policy does not touch the table', async() => {
    await handler(event('Update', {
      initialConfig: { myKey: 'myvalue' },
      updatePolicy: 'unknown',
    }));

    expect(dynamo.calls()).toHaveLength(0);
  });

  test('Delete does not touch the table', async() => {
    await handler(event('Delete', {
      initialConfig: { myKey: 'myvalue' },
      updatePolicy: 'add',
    }));

    expect(dynamo.calls()).toHaveLength(0);
  });
});
