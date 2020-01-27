import { spawn } from 'child-process-promise'
import { remove, symlink } from 'fs-extra'
import P from 'path'
import { mapValues, values, promiseAll, replace, trim } from '@dword-design/functions'
import workspaceGlob from '../workspace-glob'
import config from '@dword-design/base-config'

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

    const { bin: binEntries = {} } = require(P.resolve('package.json'))
    await binEntries
      |> mapValues((filename, binName) => remove(P.join('node_modules', '.bin', binName))
        .then(() => symlink(
          P.relative(P.join('node_modules', '.bin'), filename |> replace('dist', 'src')),
          P.join('node_modules', '.bin', binName),
        )),
      )
      |> values
      |> promiseAll

    return workspaceGlob !== undefined
      ? spawn('wsrun', ['--bin', 'npx', '-c', 'base', 'test'], { stdio: 'inherit' })
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
        },
      )
  },
}
