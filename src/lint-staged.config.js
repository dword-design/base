const { resolve } = require('path')

module.exports = {
  ['*.{js,vue}']: resolve(__dirname, 'eslint-lint-staged.js'),
}
