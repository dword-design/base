#!/usr/bin/env node

const { last, find } = require('lodash')
const babelRegister = require('@babel/register')
const babelConfig = require('./babel.config')
const eslintConfig = require('./eslintrc')
const getVariables = require('./get-variables')
const getType = require('./get-type')
const { resolve } = require('path')

const commandName = last(process.argv)
const type = getType()
const variables = getVariables()

babelRegister({ ...babelConfig, ignore: [/node_modules/] })

find(type.commands, { name: commandName }).handler({
  babelConfig,
  eslintConfig,
  variables,
  basePath: resolve(__dirname, '..'),
})
