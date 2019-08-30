const { resolve } = require('path')
const resolveBin = require('resolve-bin')

module.exports = {
  [`*.{js,vue}`]: `"${resolveBin.sync('eslint')}" --config "${resolve(__dirname, 'eslintrc.js')}" --resolve-plugins-relative-to ${__dirname}`,
}
