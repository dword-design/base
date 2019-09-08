#!/usr/bin/env node

const { fork } = require('child-process-promise')
const { chain, some, map } = require('lodash')
const getType = require('./get-type')
const yesSir = require('@dword-design/yes-sir')

const commands = require('./commands')
const type = getType()

yesSir({
  commands: map(
    [
      ...chain(commands)
        .map(command => ({ isEnabled: true, ...command }))
        .filter({ isEnabled: true }),
      ...chain(type.commands)
        .filter(({ name }) => !some(commands, { name }))
        .map(command => ({
          ...command,
          handler: () => fork(require.resolve('./run-workspace-command'), [command.name]),
        }))
        .value(),
    ],
    command => ({
      ...command,
      handler: (...args) => command.handler(...args)
        .catch(error => {
          if (error.name === 'ChildProcessError') {
            process.exit(error.code)
          } else {
            throw error
          }
        }),
    })
  ),
  defaultCommandName: 'install',
})
