const findUp = require('find-up')

const variablesPath = findUp.sync('variables.base.js')

module.exports = {
  variables: variablesPath !== undefined ? require(variablesPath) : {},
  ...variablesPath !== undefined ? { path: variablesPath } : {},
}
