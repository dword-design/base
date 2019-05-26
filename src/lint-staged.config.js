const path = require('path')

module.exports = {
  "*.{js,vue}": `eslint --config "${path.resolve(__dirname, 'eslintrc.js')}"`,
}
