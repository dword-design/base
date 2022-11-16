import { mapValues, pick, stubTrue } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { existsSync } from 'fs-extra'
import sortKeys from 'sort-keys'

export default config => {
  const commandNames = {
    checkUnknownFiles: true,
    commit: true,
    lint: true,
    prepare: true,
    ...(config.testInContainer && { 'test:raw': true }),
    test: true,
    ...(config.commands |> mapValues(stubTrue)),
  }
  return {
    ...(config.package
      |> pick([
        'name',
        'private',
        'deploy',
        'description',
        'baseConfig',
        'bin',
        'keywords',
        'dependencies',
        'devDependencies',
        'peerDependencies',
        'publishConfig',
        'type',
        'types',
      ])),
    funding: 'https://github.com/sponsors/dword-design',
    publishConfig: {
      access: 'public',
    },
    version: config.package.version || '1.0.0',
    ...(config.git && { repository: `dword-design/${config.git.project}` }),
    author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
    engines: {
      node: `>=${config.supportedNodeVersions[0]}`,
    },
    files: ['dist', ...(existsSync('types.d.ts') ? ['types.d.ts'] : [])],
    license: 'MIT',
    scripts:
      commandNames
      |> mapValues((nothing, name) =>
        config.package.name === '@dword-design/base'
          ? `rimraf dist && babel --config-file ${packageName`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
          : `base ${name}`
      )
      |> sortKeys,
  }
}
