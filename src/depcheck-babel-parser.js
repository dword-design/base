const { parseSync } = require('@babel/core')
const { resolve } = require('path')

module.exports = content => parseSync(content, { configFile: resolve(__dirname, 'babel.config.js') })
