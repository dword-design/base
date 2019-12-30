import makeCli from 'make-cli'
import commands from './commands'
import { mapValues, values } from '@dword-design/functions'

export default () => makeCli({
  commands: commands
    |> mapValues((command, name) => ({
      ...command,
      name: name,
      handler: async (...args) => {
        try {
          return command.handler(...args) |> await
        } catch (error) {
          console.log(error.message)
          process.exit(1)
        }
      },
    }))
    |> values,
})
