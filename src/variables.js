const path = require('path')
const variablesPath = require('./variables-path')
const babelRegister = require('@babel/register')
const safeRequire = require('safe-require')

babelRegister({
  configFile: path.resolve(__dirname, 'babel.config.js'),
  ignore: [/node_modules/],
})

module.exports = safeRequire(variablesPath)
