const getVariablesPath = require('./get-variables-path')
const getType = require('./get-type')
const { resolve } = require('path')

module.exports = () => ({
  '@variables': getVariablesPath(),
  '@functions': '@dword-design/functions',
  '@test': '@dword-design/jest-expect-fp',
  ...getType().aliases,
})
