const path = require('path')
const readPkgUp = require('read-pkg-up')
const getType = require('./get-type')

const { package: { typeName = 'lib' } } = readPkgUp.sync()
const type = getType(typeName)

module.exports = {
  [`*.{js,vue}`]: `"${require.resolve('eslint/bin/eslint.js')}" --config "${path.resolve(__dirname, 'eslintrc.js')}"`,
}
