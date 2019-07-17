#!/usr/bin/env node

const { fork } = require('child-process-promise')
const path = require('path')
const program = require('commander')
const { forIn, chain, some, find, reduce } = require('lodash')
const findBasePath = require('./find-base-path')
const findVariables = require('./find-config')
const findWorkspaceConfig = require('./find-workspace-config')

const commands = require('./commands')

Promise.all([findWorkspaceConfig(), findBasePath(), findVariables()])
  .then(([{ type }, basePath, variables]) => {

    forIn(
      [
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
      ({ name, desc, options, handler }) => reduce(
        options,
        (command, { name, desc, defaultValue }) => command.option(name, desc, defaultValue),
        program
          .command(name)
          .description(desc)
          .action((...args) => handler(...args)
            .catch(error => {
              if (error.name === 'ChildProcessError') {
                process.exit(error.code)
              } else {
                console.error(error.message)
              }
            })
          ),
      )
    )

    return Promise.resolve()
      .then(() => process.argv.length <= 2 && find(commands, { name: 'install' }).handler())
      .then(() => program.on('command:*', () => program.help()))
      .then(() => program.parse(process.argv))
  })
