const { parseSync } = require('@babel/core')

module.exports = content => parseSync(content, babelConfig)
