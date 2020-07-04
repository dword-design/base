#!/usr/bin/env node

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import commands from './commands'

makeCli({
  commands:
    commands
    |> mapValues((command, name) => ({
      ...command,
      handler: async (...args) => {
        try {
          return command.handler(...args) |> await
        } catch (error) {
          console.log(error.message)
          process.exit(1)
          return undefined
        }
      },
      name,
    }))
    |> values,
})
