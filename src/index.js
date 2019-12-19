import makeCli from 'make-cli'
import commands from './commands'
import { mapValues, values } from '@dword-design/functions'

export default () => makeCli({
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
