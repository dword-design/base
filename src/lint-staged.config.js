const path = require('path')
const findWorkspaceConfig = require('./find-workspace-config')

const { type } = findWorkspaceConfig()

module.exports = {
  [`*.{js,vue}`]: `"${require.resolve('eslint/bin/eslint.js')}" --config "${path.resolve(__dirname, 'eslintrc.js')}"`,
}
