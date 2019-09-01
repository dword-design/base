#!/usr/bin/env node

const { fork } = require('child-process-promise')
const path = require('path')
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
          handler: () => fork(path.resolve(__dirname, 'run-workspace-command.js'), [command.name]),
        }))
        .value(),
    ],
    command => ({
      ...command,
      handler: (...args) => command.handler(...args)
        .catch(({ name, code }) => name === 'ChildProcessError' && process.exit(code)),
    })
  ),
  defaultCommandName: 'install',
})
