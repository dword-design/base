const getVariablesPath = require('./get-variables-path')
const getType = require('./get-type')

module.exports = () => ({
  '@variables': getVariablesPath(),
  '@functions': require.resolve('@dword-design/functions'),
  ...getType().aliases,
})
