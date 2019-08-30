#!/usr/bin/env node

const { fork } = require('child-process-promise')
const path = require('path')
const { chain, some } = require('lodash')
const getType = require('./get-type')
const yesSir = require('@dword-design/yes-sir')

const commands = require('./commands')
const type = getType()

yesSir({
  commands: [
    ...chain(commands)
      .map(command => ({ isEnabled: true, ...command }))
      .filter({ isEnabled: true }),
    ...chain(type.commands)
      .filter(({ name }) => !some(commands, { name }))
      .map(command => ({
        ...command,
        handler: () => fork(
          path.resolve(__dirname, 'run-workspace-command.js'),
          [command.name],
          { stdio: 'inherit' },
        ),
      }))
      .value(),
  ],
  defaultCommandName: 'install',
})
