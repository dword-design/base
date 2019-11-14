#!/usr/bin/env node

import makeCli from 'make-cli'
import getCommands from './get-commands'
import { mapValues, values } from '@functions'

makeCli({
  commands: getCommands()
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
