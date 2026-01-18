import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { User } from "aws-cdk-lib/aws-iam";
import { ApplyTypeReplacements } from "../TypeMagic";
import { ConfigSecret } from "./ConfigSecret";
import { LayeredConfigTable } from "./ConfigTableConstruct";

// First define the config type
interface AppConfiguration {
  test1: number;
  test2: string;
  test3: { id: string, value: number };
  test4: { id: string, secret: string }[];
  test5: { id: string, secrets: string[] }[];
}

describe('Layerd Config Table cdk side', () => {

  // Some fields we would like to set as a secret
  // We can use number to indicate a array?
  type TypeReplacementsCdk = [
    { path: ['test4', number, 'secret']; value: ConfigSecret },
    { path: ['test5', number, 'secrets', number]; value: ConfigSecret },
  ];

  // Some type magic to support type changing
  type AppConfigurationCdk = ApplyTypeReplacements<AppConfiguration, TypeReplacementsCdk>;

  // Now define our actual config
  const appConfiguration: AppConfigurationCdk = {
    test1: 1,
    test2: 'test',
    test3: {
      id: 'test3',
      value: 3,
    },
    test4: [
      {
        id: 'test4',
        secret: new ConfigSecret('test-secret1', 'Test secret'),
      },
    ],
    test5: [
      {
        id: 'test4',
        secrets: [
          new ConfigSecret('test-secret2', 'Test secret'),
          new ConfigSecret('test-secret3', 'Test secret', {
            generateSecretString: {
              excludeCharacters: '123',
            }
          }),
        ]
      },
    ],
  }

  const app = new App();
  const stack = new Stack(app, 'stack');
  const layeredConfigTable = new LayeredConfigTable(stack, 'config', {
    config: appConfiguration,
  });

  it('can lookup secrets', () => {
    // Check if we can retreive it by name and grant stuff
    const secret = layeredConfigTable.findSecret('test-secret1');
    secret.grantRead(new User(stack, 'bla'));
  });

  it('creates the correct secrets', () => {
    const template = Template.fromStack(stack);
    expect(Object.keys(template.findResources('AWS::SecretsManager::Secret'))).toHaveLength(3);
    Object.entries(template.findResources('AWS::SecretsManager::Secret')).forEach(([_, secret]) => {
      expect(secret.Properties.description).toContain('(Managed by Gemeente Nijmegen Config package)')
    });
  });

});
