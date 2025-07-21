import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ConfigTable } from '../src/Construct/ConfigTableConstruct';

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
