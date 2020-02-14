import commit from './commit'
import depgraph from './depgraph'
import prepare from './prepare'
import release from './release'
import test from './test'
import config from './config'
import workspaceGlob from './workspace-glob'
import { mapValues } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

const parallelCommands = ['dev', 'start']

export default {
  commit: {
    handler: commit,
  },
  depgraph: {
    handler: depgraph,
  },
  prepare: {
    handler: prepare,
  },
  release: {
    handler: release,
  },
  test: {
    arguments: '[pattern]',
    options: [
      {
        name: '-g, --grep <grep>',
        description: 'Only run tests matching this string or regexp',
      },
    ],
    handler: test,
  },
  ...config.commands
    |> mapValues((command, name) => ({
      handler: (...args) => workspaceGlob !== undefined
        ? (async () => {
          try {
            const { stdout } = spawn(
              'wsrun',
              [
                ...parallelCommands.includes(name) ? [] : ['--stages', '--fast-exit'],
                '--exclude-missing',
                '--bin', require.resolve('./run-command.cli'), '-c', name,
              ],
              { capture: ['stdout'] },
            ) |> await
            console.log(stdout)
          } catch ({ stdout }) {
            throw new Error(stdout)
          }
        })()
        : command(...args),
    })),
}
