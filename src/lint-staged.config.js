const path = require('path')

module.exports = {
  "*.{js,vue}": `"${require.resolve('eslint/bin/eslint.js')}" --config "${path.resolve(__dirname, 'eslintrc.js')}"`,
}
