const getVariablesPath = require('./get-variables-path')
const babelConfig = require('./babel.config')
const babelRegister = require('@babel/register')

module.exports = () => {
  const variablesPath = getVariablesPath()

  babelRegister({ ...babelConfig, ignore: [/node_modules/] })

  return variablesPath !== undefined ? require(variablesPath) : {}
}
