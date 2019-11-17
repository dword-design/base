import makeCli from 'make-cli'
import getCommands from './get-commands'
import { mapValues, values } from '@functions'

export const babelConfigFilename = '@dword-design/babel-config'
export const eslintConfigFilename = '@dword-design/eslint-config'

export const base = (options = {}) => makeCli({
  commands: getCommands(options)
    |> mapValues((command, commandName) => ({
      ...command,
      name: commandName,
      handler: async (...args) => Promise.resolve()
        .then(() => command.handler(...args))
        .catch(error => {
          if (error.name !== 'ChildProcessError') {
            throw error
          }
          process.exit(1)
        }),
    }))
    |> values,
})
