import {
  constant,
  identity,
  ifElse,
  mapValues,
  pick,
  property,
  stubTrue,
} from '@dword-design/functions'
import { existsSync } from 'fs-extra'
import getPackageName from 'get-package-name'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'
import P from 'path'
import loadPkg from 'load-pkg'

import config from '@/src/config'

const packageConfig = loadPkg.sync() || {}

const commandNames = {
  clean: true,
  commit: true,
  lint: true,
  prepare: true,
  test: true,
  ...config.commands |> mapValues(stubTrue),
}
const gitUrl =
  existsSync('.git')
  |> ifElse(
    identity,
    () =>
      parseGitConfig.sync() |> property('remote "origin"') |> property('url'),
    constant(undefined)
  )
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
        ? `rimraf dist && babel --config-file ${getPackageName(
            require.resolve('@dword-design/babel-config')
          )} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
        : `base ${name}`
    ),
}
