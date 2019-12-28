import { spawn } from 'child-process-promise'
import { readFileSync as safeReadFileSync } from 'safe-readfile'
import { readFile, remove, symlink } from 'fs-extra'
import P from 'path'
import gitignoreConfig from '../gitignore.config'
import { sortBy, identity, map, join, filter, mapValues, values, promiseAll, replace, first } from '@dword-design/functions'
import isWorkspaceRoot from '@dword-design/is-workspace-root'
import getProjectzReadmeSectionRegex from 'get-projectz-readme-section-regex'
import workspaceGlob from '../workspace-glob'
import config from '@dword-design/base-config'
import glob from 'glob-promise'

export default {
  arguments: '[pattern]',
  handler: async pattern => {
    await spawn('ajv', ['-s', require.resolve('@dword-design/json-schema-package'), '-d', 'package.json', '--errors', 'text'], { stdio: 'inherit' })

    if (safeReadFileSync('.gitignore', 'utf8') !== (gitignoreConfig |> sortBy(identity) |> map(entry => `${entry}\n`) |> join(''))) {
      throw new Error('.gitignore file must be generated. Maybe it has been accidentally modified.')
    }
    if (isWorkspaceRoot) {
      if (safeReadFileSync('.gitpod.yml', 'utf8') !== await readFile(P.resolve(__dirname, '..', 'config-files', 'gitpod.yml'), 'utf8')) {
        throw new Error('.gitpod.yml file must be generated. Maybe it has been accidentally modified.')
      }
      if (safeReadFileSync('.renovaterc.json', 'utf8') !== await readFile(P.resolve(__dirname, '..', 'config-files', 'renovaterc.json'), 'utf8')) {
        throw new Error('.renovaterc.json file must be generated. Maybe it has been accidentally modified.')
      }
      if (safeReadFileSync('.travis.yml', 'utf8') !== await readFile(P.resolve(__dirname, '..', 'config-files', 'travis.yml'), 'utf8')) {
        throw new Error('.travis.yml file must be generated. Maybe it has been accidentally modified.')
      }
    }

    const readmeContent = safeReadFileSync('README.md', 'utf8') ?? ''
    const missingReadmeSections = ['TITLE', 'BADGES', 'DESCRIPTION', 'INSTALL', 'LICENSE']
      |> filter(sectionName => !getProjectzReadmeSectionRegex(sectionName).test(readmeContent))
    if (missingReadmeSections.length > 0) {
      throw new Error(`The README.md file is missing or misses the following sections: ${missingReadmeSections |> join(', ')}`)
    }

    if (!getProjectzReadmeSectionRegex('LICENSEFILE').test(await readFile('LICENSE.md', 'utf8'))) {
      throw new Error('LICENSE.md file must be generated. Maybe it has been accidentally modified.')
    }

    await config.lint()
    await spawn('depcheck', ['--skip-missing', true, '--config', require.resolve('../depcheck.config'), '.'], { stdio: 'inherit' })

    const binEntries = require(P.resolve('package.json')).bin ?? {}
    await binEntries
      |> mapValues((filename, binName) => remove(P.join('node_modules', '.bin', binName))
        .then(() => symlink(
          P.relative(P.join('node_modules', '.bin'), filename |> replace('dist', 'src')),
          P.join('node_modules', '.bin', binName)
        ))
      )
      |> values
      |> promiseAll

    return workspaceGlob !== undefined
      ? glob(workspaceGlob |> first)
        |> await
        |> map(path => spawn('base', ['test'], { cwd: path, stdio: 'inherit' }))
        |> promiseAll
      : spawn(
        'nyc',
        [
          '--reporter', 'lcov',
          '--reporter', 'text',
          '--cwd', process.cwd(),
          '--require', require.resolve('../pretest'),
          'mocha-per-file',
          '--timeout', 65000,
          ...pattern !== undefined ? [pattern] : [],
        ],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            BABEL_CACHE_PATH: P.join(process.cwd(), 'node_modules', '.cache', '@babel', 'register', '.babel.json'),
          },
        }
      )
  },
}
