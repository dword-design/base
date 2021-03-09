import { mapValues, pick, stubTrue } from '@dword-design/functions'
import packageName from 'depcheck-package-name'
import { existsSync } from 'fs-extra'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'
import sortObjectKeys from 'sort-object-keys'

import config from '@/src/config'
import packageConfig from '@/src/package-config'

const commandNames = {
  'check-unknown-files': true,
  commit: true,
  lint: true,
  prepare: true,
  ...(config.testInContainer && { 'test:raw': true }),
  test: true,
  ...(config.commands |> mapValues(stubTrue)),
}
const gitUrl = existsSync('.git')
  ? parseGitConfig.sync()['remote "origin"']?.url
  : undefined
const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}
if (gitUrl !== undefined && gitInfo.type !== 'github') {
  throw new Error('Only GitHub repositories are supported.')
}

export default {
  ...(packageConfig
    |> pick([
      'name',
      'private',
      'deploy',
      'baseConfig',
      'bin',
      'keywords',
      'dependencies',
      'devDependencies',
      'peerDependencies',
      'publishConfig',
      'types',
    ])),
  description: packageConfig.description || '',
  publishConfig: {
    access: 'public',
  },
  version: packageConfig.version || '1.0.0',
  ...(gitUrl && { repository: `${gitInfo.user}/${gitInfo.project}` }),
  author: 'Sebastian Landwehr <info@dword-design.de>',
  files: ['dist'],
  license: 'MIT',
  ...config.packageConfig,
  scripts:
    commandNames
    |> mapValues((nothing, name) =>
      packageConfig.name === '@dword-design/base'
        ? `rimraf dist && babel --config-file ${packageName`@dword-design/babel-config`} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
        : `base ${name}`
    )
    |> sortObjectKeys,
}
