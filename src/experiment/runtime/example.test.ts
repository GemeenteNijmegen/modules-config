import { ApplyTypeReplacements } from "../TypeMagic";
import { Config, IConfigProvider, RuntimeLoader } from "./Config";

// First define the config type
interface AppConfiguration {
  test1: number;
  test2: string;
  test3: { id: string, value: number };
  test4: { id: string, secret: string }[];
  test5: { id: string, secrets: string[] }[];
}


describe('Layerd Config Table runtime side', () => {

  type TypeReplacementsRuntime = [
    { path: ['test4', number, 'secret']; value: RuntimeLoader },
    { path: ['test5', number, 'secrets', number]; value: RuntimeLoader },
  ];

  // Some type magic to support type changing
  type AppConfigurationRuntime = ApplyTypeReplacements<AppConfiguration, TypeReplacementsRuntime>;

  it('should load and resolve secrets', async () => {
    const mockProvider: IConfigProvider = {
      get: jest.fn().mockResolvedValue({
        base: {
          test1: 1,
          test2: 'test',
          test3: {
            id: 'test3',
            value: 3,
          },
          test4: [
            {
              id: 'test4',
              secret: 'arn:aws:secretsmanager:region:account:secret:test-secret1',
            },
          ],
          test5: [
            {
              id: 'test4',
              secrets: [
                'arn:aws:secretsmanager:region:account:secret:test-secret2',
                'arn:aws:secretsmanager:region:account:secret:test-secret3',
              ]
            },
          ],
        },
        override: {},
      }),
      set: jest.fn().mockResolvedValue(true),
      getSecret: jest.fn().mockImplementation((arn) => Promise.resolve(arn)),
      getParameter: jest.fn().mockImplementation((arn) => Promise.resolve(arn)),
    };

    const config = new Config(mockProvider);
    await config.init();
    const configuration = config.get() as AppConfigurationRuntime;

    expect(configuration.test1).toBe(1);
    expect(configuration.test2).toBe('test');

    const secret = configuration.test4[0].secret;
    console.log(JSON.stringify(configuration))

    await expect(secret.getValue()).resolves.toBeDefined();
    expect(mockProvider.get).toHaveBeenCalledWith('configuration');

  });

  it('should merge override values over base', async () => {
    const mockProvider: IConfigProvider = {
      get: jest.fn().mockResolvedValue({
        base: { test1: 1, test2: 'base' },
        override: { test2: 'override' },
      }),
      set: jest.fn().mockResolvedValue(true),
      getSecret: jest.fn().mockResolvedValue('secret'),
      getParameter: jest.fn().mockResolvedValue('param'),
    };

    const config = new Config(mockProvider);
    await config.init();
    const configuration = config.get();

    expect(configuration.test1).toBe(1);
    expect(configuration.test2).toBe('override');
  });

  it('should merge nested objects', async () => {
    const mockProvider: IConfigProvider = {
      get: jest.fn().mockResolvedValue({
        base: { test3: { id: 'base', value: 1 } },
        override: { test3: { value: 2 } },
      }),
      set: jest.fn().mockResolvedValue(true),
      getSecret: jest.fn().mockResolvedValue('secret'),
      getParameter: jest.fn().mockResolvedValue('param'),
    };

    const config = new Config(mockProvider);
    await config.init();
    const configuration = config.get();

    expect(configuration.test3.id).toBe('base');
    expect(configuration.test3.value).toBe(2);
  });

  it('should merge arrays by id', async () => {
    const mockProvider: IConfigProvider = {
      get: jest.fn().mockResolvedValue({
        base: { test4: [{ id: 'a', secret: 'arn:aws:secretsmanager:region:account:secret:test-secret1' }] },
        override: { test4: [{ id: 'a', secret: 'arn:aws:secretsmanager:region:account:secret:test-secret3' }] },
      }),
      set: jest.fn().mockResolvedValue(true),
      getSecret: jest.fn().mockImplementation((arn) => Promise.resolve(arn)),
      getParameter: jest.fn().mockResolvedValue('param'),
    };

    const config = new Config(mockProvider);
    await config.init();
    const configuration = config.get() as AppConfigurationRuntime;

    expect(configuration.test4[0].id).toBe('a');
    await expect(configuration.test4[0].secret.getValue()).resolves.toContain('test-secret3'); // Overwritten
  });

});