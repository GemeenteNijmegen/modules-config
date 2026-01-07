import { GemeenteNijmegenCdkLib } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkLib({
  repositoryUrl: 'git://github.com/GemeenteNijmegen/modules-config',
  author: 'Gemeente Nijmegen',
  authorAddress: 'gemeente@nijmegen.nl',
  defaultReleaseBranch: 'main',
  cdkVersion: '2.233.0',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
  ],
  bundledDeps: [
    '@gemeentenijmegen/utils',
    '@types/aws-lambda',
    '@aws-sdk/client-dynamodb',
  ],
  peerDeps: [
    'aws-cdk-lib',
    'constructs',
  ],
  name: '@gemeentenijmegen/config',
  projenrcTs: true,
  repository: 'GemeenteNijmegen/modules-config',
  gitIgnoreOptions: {
    ignorePatterns: [
      'cdk.out',
    ],
  },
  tsconfig: {
    compilerOptions: {
      isolatedModules: true,
    },
  },
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();
