import { GemeenteNijmegenCdkLib } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkLib({
  author: 'nijmegen',
  authorAddress: 'bla@example.com',
  repositoryUrl: 'https://github',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    '@types/aws-lambda',
  ],
  bundledDeps: [
    '@aws-sdk/client-dynamodb',
    '@gemeentenijmegen/utils',
  ],
  name: 'modules-config',
  projenrcTs: true,
  repository: 'gemeentenijmegen/modules-config',

  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
