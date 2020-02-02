import { spawn } from 'child-process-promise'
import { remove, symlink } from 'fs-extra'
import P from 'path'
import { mapValues, values, promiseAll, replace } from '@dword-design/functions'
import workspaceGlob from './workspace-glob'
import config from './config'
import testConfigFiles from './test-config-files'

export default async pattern => {
  await testConfigFiles()
  await config.test()
  try {
    await spawn('depcheck', ['--skip-missing', true, '--config', require.resolve('./depcheck.config'), '.'], { capture: ['stdout', 'stderr'] })
  } catch ({ stdout }) {
    throw new Error(stdout)
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
    ? spawn('wsrun', ['--bin', require.resolve('./run-command.cli'), '-c', 'test'], { stdio: 'inherit' })
    : spawn(
      'nyc',
      [
        '--reporter', 'lcov',
        '--reporter', 'text',
        '--cwd', process.cwd(),
        '--require', require.resolve('./pretest'),
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
}
