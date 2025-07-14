import { GemeenteNijmegenCdkLib } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenCdkLib({
  author: 'Joost van der Borg',
  authorAddress: 'j.van.der.borg@nijmegen.nl',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['@gemeentenijmegen/projen-project-type'],
  jsiiVersion: '~5.8.0',
  name: 'modules-config',
  projenrcTs: true,
  repository: 'gemeentenijmegen/modules-config',
  repositoryUrl: 'https://github.com/j.van.der.borg/modules-config.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();