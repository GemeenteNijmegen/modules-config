import { GemeenteNijmegenCdkLib } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkLib({
  repositoryUrl: 'git://github.com/GemeenteNijmegen/modules-config',
  author: 'Gemeente Nijmegen',
  authorAddress: 'gemeente@nijmegen.nl',
  defaultReleaseBranch: 'main',
  cdkVersion: '2.1.0',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    'aws-cdk-lib',
  ],
  bundledDeps: [
    '@types/aws-lambda',
    '@aws-sdk/client-dynamodb',
    '@gemeentenijmegen/utils',
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
// To prevent the runtime import from importing the entire CDK, we explicitly export 
// the config or the cdk construct
project.package.addField('exports', {
  './construct': {
    types: './lib/Construct/ConfigTableConstruct.d.ts',
    import: './lib/Construct/ConfigTableConstruct.js',
    require: './lib/Construct/ConfigTableConstruct.js',
  },
  './config': {
    types: './lib/Config.d.ts',
    import: './lib/Config.js',
    require: './lib/Config.js',
  },
  './package.json': './package.json',
});

project.synth();
