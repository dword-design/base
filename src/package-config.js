import {
  constant,
  identity,
  ifElse,
  keys,
  map,
  pick,
  property,
  zipObject,
} from '@dword-design/functions'
import { existsSync } from 'fs-extra'
import getPackageName from 'get-package-name'
import hostedGitInfo from 'hosted-git-info'
import parseGitConfig from 'parse-git-config'
import P from 'path'
import safeRequire from 'safe-require'

import commands from './additional-commands'
import config from './config'

const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) || {}
const commandNames = ['prepare', ...(commands |> keys)]
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
  version: packageConfig.version || '1.0.0',
  description: packageConfig.description || '',
  publishConfig: {
    access: 'public',
  },
  ...(gitUrl !== undefined
    ? { repository: `${gitInfo.user}/${gitInfo.project}` }
    : {}),
  license: 'MIT',
  author: 'Sebastian Landwehr <info@dword-design.de>',
  files: ['dist'],
  ...(config |> pick('main')),
  ...config.packageConfig,
  scripts: zipObject(
    commandNames,
    commandNames
      |> map(name =>
        packageConfig.name === '@dword-design/base'
          ? `rimraf dist && babel --config-file ${getPackageName(
              require.resolve('@dword-design/babel-config')
            )} --copy-files --no-copy-ignored --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
          : `base ${name}`
      )
  ),
}
