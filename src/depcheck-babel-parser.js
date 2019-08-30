const { parseSync } = require('@babel/core')
const babelConfig = require('./babel.config')

module.exports = content => {
  return parseSync(content, babelConfig)
}
