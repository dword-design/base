#!/usr/bin/env node

const readPkgUp = require('read-pkg-up')
const getType = require('./get-type')
const { last, find } = require('lodash')

const commandName = last(process.argv)

Promise.resolve()
  .then(() => readPkgUp())
  .then(({ package: { typeName = 'lib' } }) => find(getType(typeName).commands, { name: commandName }).handler())
  .catch(error => {
    if (error.name === 'ChildProcessError') {
      process.exit(error.code)
    } else {
      throw(error)
    }
  })
