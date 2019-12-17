import makeCli from 'make-cli'
import commands from './commands'
import minimalPackageConfig from './minimal-package.config'
import minimalProjectConfig from './minimal-project.config'
import minimalWorkspaceConfig from './minimal-workspace.config'
import { mapValues, values } from '@dword-design/functions'

export const execute = () => makeCli({
  commands: commands
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

export { minimalPackageConfig, minimalProjectConfig, minimalWorkspaceConfig }
