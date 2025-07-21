import { Config, IConfigProvider } from '../src/Config';

class MockConfigProvider implements IConfigProvider {
  constructor(private sampleObject: any) {

  }
  getSecret(_arn: string): Promise<any> {
    return Promise.resolve('secretvalue');
  }
  getParameter(_arn: string): Promise<any> {
    return Promise.resolve('parametervalue');
  }
  async get(_key: string): Promise<any> {
    return Promise.resolve(this.sampleObject[_key]);
  }

  async set(_key: string, _value: any): Promise<boolean> {
    return Promise.resolve(true);
  }
}

describe('Test config', () => {
  test('gets values', async() => {
    const config = new Config(new MockConfigProvider({ testKey: 'testvalue' }));
    expect(await config.get('testKey')).toBe('testvalue');
  });

  test('gets a secret arn and retrieves secret', async() => {
    const config = new Config(new MockConfigProvider({ testEncrypted: 'arn:aws:secretsmanager:eu-central-1:1234:secret:mysecret-123456' }));
    const spy = jest.spyOn(config, 'retrieveReferencedValue');
    expect(await config.get('testEncrypted')).toBe('secretvalue');
    expect(spy).toHaveBeenCalled();
  });

  test('Getting a nested secret arn should retrieve secret', async() => {
    const config = new Config(new MockConfigProvider({
      myKey: {
        myValueOne: 'test',
        testEncrypted: 'arn:aws:secretsmanager:eu-central-1:1234:secret:mysecret-123456',
      },
    },
    ));
    const spy = jest.spyOn(config, 'retrieveReferencedValue');
    const result = await config.get('myKey');
    expect(result).toHaveProperty('myValueOne');
    expect(result).toHaveProperty('testEncrypted');
    expect(result.testEncrypted).toBe('secretvalue');
    expect(spy).toHaveBeenCalled();
  });

  test('gets nested arns and retrieves secrets and params in original object', async() => {
    const config = new Config(new MockConfigProvider({
      myKey: {
        myValueOne: 'test',
        testEncrypted: 'arn:aws:secretsmanager:eu-central-1:1234:secret:mysecret-123456',
        somenestedArray: [
          'arn:aws:secretsmanager:eu-central-1:1234:secret:mysecret-345678',
          'somevalue',
          'mycat',
        ],
        another: {
          nested: {
            object: 'arn:aws:secretsmanager:eu-central-1:1234:secret:mysecret-345678',
            parameter: 'arn:aws:ssm:eu-central-1:1234:parameter/myparam',
          },
        },
      },
    },
    ));
    const result = await config.get('myKey');
    expect(result.testEncrypted).toBe('secretvalue');
    expect(result.another.nested.object).toBe('secretvalue');
    expect(result.another.nested.parameter).toBe('parametervalue');
    expect(result.somenestedArray[0]).toBe('secretvalue');
  });
});
