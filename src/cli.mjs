#!/usr/bin/env node --experimental-json-modules

import { mapValues, values } from '@dword-design/functions'
import makeCli from 'make-cli'

import commands from './commands/index.mjs'

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
