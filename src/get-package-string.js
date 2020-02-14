import P from 'path'
import safeRequire from 'safe-require'
import parseGitConfig from 'parse-git-config'
import hostedGitInfo from 'hosted-git-info'
import { jsonToString, add, mapValues, pick, property } from '@dword-design/functions'
import sortpackageConfig from 'sort-package-json'
import config from './config'
import { exists } from 'fs-extra'
import commands from './commands'

export default async () => {
  const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) ?? {}

  const gitUrl = (await exists('.git'))
    ? parseGitConfig({ path: P.resolve('.git', 'config') })
      |> await
      |> property('remote "origin"')
      |> property('url')
    : undefined

  const gitInfo = hostedGitInfo.fromUrl(gitUrl) || {}

  if (gitUrl !== undefined && gitInfo.type !== 'github') {
    throw new Error('Only GitHub repositories are supported.')
  }
  return {
    ...packageConfig
      |> pick([
        'name',
        'private',
        'baseConfig',
        'bin',
        'keywords',
        'dependencies',
        'devDependencies',
      ]),
    version: packageConfig.version ?? '1.0.0',
    description: packageConfig.description ?? '',
    ...gitUrl !== undefined ? { repository: `${gitInfo.user}/${gitInfo.project}` } : {},
    license: 'MIT',
    author: 'Sebastian Landwehr <info@dword-design.de>',
    files: ['dist'],
    main: `dist/${config.main}`,
    scripts: commands
      |> mapValues((command, name) => packageConfig.name === '@dword-design/base'
        ? `rimraf dist && babel --config-file @dword-design/babel-config --out-dir dist --ignore "**/*.spec.js" src && node dist/cli.js ${name}`
        : `base ${name}`,
      ),
  }
    |> sortpackageConfig
    |> jsonToString({ indent: 2 })
    |> add('\n')
}
