import makeCli from 'make-cli'
import getCommands from './get-commands'
import minimalPackageConfig from './minimal-package.config'
import minimalProjectConfig from './minimal-project.config'
import { mapValues, values } from '@functions'

export const base = (options = {}) => makeCli({
  commands: getCommands(options)
    |> mapValues((command, commandName) => ({
      ...command,
      name: commandName,
      handler: async (...args) => Promise.resolve()
        .then(() => command.handler(...args))
        .catch(error => {
          console.error(error.message)
          process.exit(1)
        }),
    }))
    |> values,
})

export { minimalPackageConfig, minimalProjectConfig }
