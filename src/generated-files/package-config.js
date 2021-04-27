import { mapValues, pick, stubTrue } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import sortKeys from 'sort-keys'

import config from '@/src/config'
import packageConfig from '@/src/package-config'

import gitInfo from './git-info'

const commandNames = {
  checkUnknownFiles: true,
  commit: true,
  lint: true,
  prepare: true,
  ...(config.testInContainer && { 'test:raw': true }),
  test: true,
  ...(config.commands |> mapValues(stubTrue)),
}

export default {
  ...(packageConfig
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
      'types',
    ])),
  funding: 'https://www.buymeacoffee.com/dword',
  publishConfig: {
    access: 'public',
  },
  version: packageConfig.version || '1.0.0',
  ...(gitInfo && { repository: `dword-design/${gitInfo.project}` }),
  author: 'Sebastian Landwehr <info@dword-design.de>',
  files: ['dist'],
  license: 'MIT',
  engines: {
    "node": ">=12"
  },
  ...config.packageConfig,
  scripts:
    commandNames
    |> mapValues((nothing, name) =>
      packageConfig.name === '@dword-design/base'
        ? `rimraf dist && babel --config-file ${packageName`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
        : `base ${name}`
    )
    |> sortKeys,
}
