#!/usr/bin/env node

const { fork } = require('child-process-promise')
const path = require('path')
const { chain, some } = require('lodash')
const findBasePath = require('./find-base-path')
const findVariables = require('./find-config')
const findWorkspaceConfig = require('./find-workspace-config')
const yesSir = require('@dword-design/yes-sir')

const commands = require('./commands')

Promise.all([findWorkspaceConfig(), findBasePath(), findVariables()])
  .then(([{ type }, basePath, variables]) => yesSir({
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
            { stdio: 'inherit', env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: JSON.stringify(variables) } }
          ),
        }))
        .value(),
    ],
    defaultCommandName: 'install',
  }))
  .catch(error => {
    if (error.name === 'ChildProcessError') {
      process.exit(error.code)
    } else {
      console.error(error.message)
    }
  })
