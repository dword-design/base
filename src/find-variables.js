const path = require('path')
const variablesPath = require('./variables-path')
const babelRegister = require('@babel/register')
const safeRequire = require('safe-require')

module.exports = () => {
  babelRegister({
    configFile: path.resolve(__dirname, 'babel.config.js'),
    ignore: [/node_modules/],
  })
  return variablesPath !== undefined ? safeRequire(variablesPath) : undefined
}
