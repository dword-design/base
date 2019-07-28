#!/usr/bin/env node

const findWorkspaceConfig = require('./find-workspace-config')
const { last, find } = require('lodash')
const path = require('path')
const babelRegister = require('@babel/register')

const commandName = last(process.argv)

babelRegister({
  configFile: path.resolve(__dirname, 'babel.config.js'),
  ignore: [/node_modules/],
})

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
