import P from 'path'
import safeRequire from 'safe-require'
import parseGitConfig from 'parse-git-config'
import hostedGitInfo from 'hosted-git-info'
import { jsonToString, add, mapValues, pick } from '@dword-design/functions'
import sortpackageConfig from 'sort-package-json'
import config from './config'
import { exists } from 'fs-extra'
import findYarnWorkspaceRoot from 'find-yarn-workspace-root'
import commands from './commands'

export default async () => {
  const workspaceRoot = findYarnWorkspaceRoot()
  const gitRoot = workspaceRoot !== null ? workspaceRoot : process.cwd()
  const packageConfig = safeRequire(P.join(process.cwd(), 'package.json')) ?? {}

  const gitUrl = (await exists(P.join(gitRoot, '.git')))
    ? (await parseGitConfig({ path: P.resolve(gitRoot, '.git', 'config') }))['remote "origin"'].url
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
    ...packageConfig.workspaces !== undefined
      ? { workspaces: ['packages/*'], private: true }
      : {},
    version: packageConfig.version ?? '1.0.0',
    description: packageConfig.description ?? '',
    ...gitUrl !== undefined ? { repository: `${gitInfo.user}/${gitInfo.project}` } : {},
    license: 'MIT',
    author: 'Sebastian Landwehr <info@dword-design.de>',
    files: ['dist'],
    main: `dist/${config.main}`,
    scripts: commands
      |> mapValues((command, name) => packageConfig.name === '@dword-design/base'
        ? `rimraf dist && babel --out-dir dist --config-file @dword-design/babel-config --copy-files src && node dist/cli.js ${name}`
        : `base ${name}`,
      ),
  }
    |> sortpackageConfig
    |> jsonToString({ indent: 2 })
    |> add('\n')
}
