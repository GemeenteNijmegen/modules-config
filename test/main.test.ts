import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ConfigTable } from '../src/Construct/ConfigTableConstruct';

describe('ConfigTable', () => {
  test('synthesizes the same DynamoDB table (snapshot)', () => {
    const app = new App();
    const stack = new Stack(app, 'TestStack');

    new ConfigTable(stack, 'config', {
      config: { myKey: 'myvalue' },
    });

    const template = Template.fromStack(stack);

    // Snapshot only the table resources (less noisy than snapshotting the whole template)
    const tables = template.findResources('AWS::DynamoDB::Table');
    expect(Object.keys(tables).length).toBe(1);

    expect(Object.values(tables)).toMatchSnapshot();
  });
  test('Creating custom resource', async() => {
    const stack = new Stack();
    new ConfigTable(stack, 'config', {
      config: {
        myKey: 'myvalue',
      },
    });
    const template = Template.fromStack(stack);
    console.debug(JSON.stringify(template.toJSON(), null, 2));
  });
});
