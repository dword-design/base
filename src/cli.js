#!/usr/bin/env node

const makeCli = require('make-cli')
const mapValues = require('@dword-design/functions/mapValues')
const commands = require('./commands')

makeCli({
  commands: commands.map(
    command => ({
      ...command,
      handler: async () => {
        try {
          return await command.handler({ log: true })
        } catch (error) {
          if (error.name === 'ChildProcessError') {
            process.exit(1)
          } else {
            throw new error
          }
        }
      },
    })
  ),
})
