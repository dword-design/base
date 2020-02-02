import depgraph from './depgraph'
import prepare from './prepare'
import test from './test'
import config from './config'
import workspaceGlob from './workspace-glob'
import { mapValues } from '@dword-design/functions'
import { spawn } from 'child-process-promise'

const parallelCommands = ['dev', 'start']

export default {
  depgraph: {
    handler: depgraph,
  },
  prepare: {
    handler: prepare,
  },
  test: {
    arguments: '[pattern]',
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
