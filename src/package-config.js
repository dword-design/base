import P from 'path'
import safeRequire from 'safe-require'
import parseGitConfig from 'parse-git-config'
import hostedGitInfo from 'hosted-git-info'
import { pick, property, ifElse, constant, identity, keys, map, zipObject } from '@dword-design/functions'
import config from './config'
import { existsSync } from 'fs-extra'
import commands from './additional-commands'

const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) ?? {}
const commandNames = ['prepare', ...commands |> keys]

const gitUrl = existsSync('.git')
  |> ifElse(
    identity,
    () => parseGitConfig.sync()
      |> property('remote "origin"')
      |> property('url'),
    constant(undefined),
  )

const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}

if (gitUrl !== undefined && gitInfo.type !== 'github') {
  throw new Error('Only GitHub repositories are supported.')
}

export default {
  ...packageConfig
    |> pick([
      'name',
      'private',
      'baseConfig',
      'bin',
      'keywords',
      'dependencies',
      'devDependencies',
      'publishConfig',
    ]),
  version: packageConfig.version ?? '1.0.0',
  description: packageConfig.description ?? '',
  publishConfig: {
    access: 'public',
  },
  ...gitUrl !== undefined ? { repository: `${gitInfo.user}/${gitInfo.project}` } : {},
  license: 'MIT',
  author: 'Sebastian Landwehr <info@dword-design.de>',
  files: ['dist'],
  main: `dist/${config.main}`,
  scripts: zipObject(
    commandNames,
    commandNames |> map(name => packageConfig.name === '@dword-design/base'
      ? `rimraf dist && babel --config-file @dword-design/babel-config --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
      : `base ${name}`,
    ),
  ),
}
