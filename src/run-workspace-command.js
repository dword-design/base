#!/usr/bin/env node

const findWorkspaceConfig = require('./find-workspace-config')
const { last, find } = require('lodash')

const commandName = last(process.argv)

Promise.resolve()
  .then(() => findWorkspaceConfig())
  .then(({ type }) => find(type.commands, { name: commandName }).handler())
  .catch(error => {
    if (error.name === 'ChildProcessError') {
      process.exit(error.code)
    } else {
      throw(error)
    }
  })
