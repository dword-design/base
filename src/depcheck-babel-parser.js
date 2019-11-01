const { parseSync } = require('@babel/core')
const babelConfig = require('@dword-design/babel-config')

module.exports = content => parseSync(content, babelConfig)
