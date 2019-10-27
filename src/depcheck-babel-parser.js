const { parseSync } = require('@babel/core')
const babelConfig = require('../babel.config')

module.exports = content => parseSync(content, babelConfig)
