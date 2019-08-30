const nodeEnv = require('@dword-design/node-env')
const resolveBin = require('resolve-bin')
const { resolve } = require('path')
const { spawn } = require('child-process-promise')

module.exports = {
  name: 'lint-staged',
  description: 'Outputs linting errors for staged files',
  handler: () => spawn(
    resolveBin.sync('lint-staged'),
    ['.', '--config', resolve(__dirname, '../lint-staged.config.js')],
    { stdio: 'inherit' },
  ),
  isEnabled: nodeEnv === 'development',
}
