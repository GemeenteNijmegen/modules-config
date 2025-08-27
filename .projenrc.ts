import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
  ],
  peerDeps: [
    '@aws-sdk/client-dynamodb',
    '@gemeentenijmegen/utils',
    '@types/aws-lambda',
    'aws-cdk-lib',
    'constructs',
  ],
  name: '@gemeentenijmegen/config',
  projenrcTs: true,
  repository: 'GemeenteNijmegen/modules-config',

  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
