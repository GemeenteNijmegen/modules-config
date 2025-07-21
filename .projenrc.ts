import { GemeenteNijmegenTsPackage } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenTsPackage({
  defaultReleaseBranch: 'main',
  deps: [
    '@gemeentenijmegen/projen-project-type',
    '@types/aws-lambda',
    'constructs',
  ],
  bundledDeps: [
    '@aws-sdk/client-dynamodb',
    '@gemeentenijmegen/utils',
    'aws-cdk-lib',
  ],
  name: '@gemeentenijmegen/modules-config',
  projenrcTs: true,
  repository: 'GemeenteNijmegen/modules-config',

  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
