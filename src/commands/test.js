import { spawn } from 'child-process-promise'
import { remove, symlink } from 'fs-extra'
import P from 'path'
import { map, mapValues, values, promiseAll, replace, first, trim } from '@dword-design/functions'
import workspaceGlob from '../workspace-glob'
import config from '@dword-design/base-config'
import glob from 'glob-promise'

export default {
  arguments: '[pattern]',
  handler: async pattern => {
    try {
      await spawn('config-files', ['test'], { capture: ['stdout'] })
    } catch (error) {
      throw new Error(error.stdout |> trim)
    }
    await config.lint()
    try {
      await spawn('depcheck', ['--skip-missing', true, '--config', require.resolve('../depcheck.config'), '.'], { capture: ['stdout'] })
    } catch (error) {
      throw new Error(error.stdout)
    }

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
          '--timeout', 80000,
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
