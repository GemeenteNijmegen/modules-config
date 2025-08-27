import { Config, IConfigProvider } from '../src/Config';

class MockConfigProvider implements IConfigProvider {
  private store: Map<string, any>;

  constructor(sampleObject: any) {
    this.store = new Map();
    for(let key of Object.keys(sampleObject)) {
      console.debug('constructing: ', key, JSON.stringify(sampleObject[key]));
      this.store.set(key, JSON.stringify(sampleObject[key]));
    }
  }
  getSecret(_arn: string): Promise<any> {
    return Promise.resolve('secretvalue');
  }
  getParameter(_arn: string): Promise<any> {
    return Promise.resolve('parametervalue');
  }
  async get(key: string): Promise<any> {
    const value = this.store.get(key)
    console.debug('getting', key, value);
    return Promise.resolve(value ? JSON.parse(value) : undefined);
  }

  async set(key: string, value: any): Promise<boolean> {
    this.store.set(key, JSON.stringify(value));
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

describe('Update strategy', () => {
  test('add will only add new keys', async() => {
    const config = new Config(new MockConfigProvider({
      myKey: {
        myValueOne: 'test',
      },
      mySecondKey: 'somevalue'
    },
    ));
    const result = await config.get('myKey');
    expect(result.myValueOne).toBe('test');

    await config.addKeys({mySecondKey: 'mynewvalue' }); //shouldnt update
    await config.addKeys({myThirdKey: 'mythirdvalue' }); //should add

    expect(await config.get('mySecondKey')).toBe('somevalue');
    expect(await config.get('myThirdKey')).toBe('mythirdvalue');
  });

  test('adding bulk will only add new keys', async() => {
    const config = new Config(new MockConfigProvider({
      myKey: {
        myValueOne: 'test',
      },
      mySecondKey: 'somevalue'
    },
    ));
    const result = await config.get('myKey');
    expect(result.myValueOne).toBe('test');

    await config.addKeys({mySecondKey: 'mynewvalue', myThirdKey: 'mythirdvalue' }); //should update only mythirdkey    

    expect(await config.get('mySecondKey')).toBe('somevalue');
    expect(await config.get('myThirdKey')).toBe('mythirdvalue');
  });
});
