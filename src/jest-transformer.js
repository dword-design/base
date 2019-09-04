const babelJest = require('babel-jest')
const { resolve } = require('path')

module.exports = babelJest.createTransformer({ configFile: resolve(__dirname, 'babel.config.js') })
