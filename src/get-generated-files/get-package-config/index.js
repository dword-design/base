import { mapValues, pick, stubTrue } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import fs from 'fs-extra'
import sortKeys from 'sort-keys'

export default function () {
  const commandNames = {
    checkUnknownFiles: true,
    commit: true,
    lint: true,
    prepare: true,
    ...(this.config.testInContainer && { 'test:raw': true }),
    test: true,
    ...(this.config.commands |> mapValues(stubTrue)),
  }

  return {
    ...(this.packageConfig
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
    version: this.packageConfig.version || '1.0.0',
    ...(this.config.git && {
      repository: `dword-design/${this.config.git.project}`,
    }),
    author: 'Sebastian Landwehr <info@sebastianlandwehr.com>',
    engines: {
      node: `>=${this.config.supportedNodeVersions[0]}`,
    },
    files: ['dist', ...(fs.existsSync('types.d.ts') ? ['types.d.ts'] : [])],
    license: 'MIT',
    ...this.config.packageConfig,
    scripts:
      commandNames
      |> mapValues((nothing, name) =>
        this.packageConfig.name === '@dword-design/base'
          ? `rimraf dist && babel --config-file ${packageName`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
          : `base ${name}`
      )
      |> sortKeys,
  }
}