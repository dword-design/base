const findUpSync = require('findup-sync')

const variablesPath = findUpSync('variables.base.js') || undefined

module.exports = {
  variables: variablesPath !== undefined ? require(variablesPath) : {},
  ...variablesPath !== undefined ? { path: variablesPath } : {},
}
