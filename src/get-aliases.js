const getVariablesPath = require('./get-variables-path')
const getType = require('./get-type')
const { resolve } = require('path')

module.exports = () => ({
  '@variables': getVariablesPath(),
  '@functions': require.resolve('@dword-design/functions'),
  '@test': require.resolve('@dword-design/jest-expect-fp'),
  ...getType().aliases,
})
