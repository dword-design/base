const nodeEnv = require('@dword-design/node-env')
const resolveBin = require('resolve-bin')
const { resolve } = require('path')
const { fork } = require('child-process-promise')

module.exports = {
  name: 'lint-staged',
  description: 'Outputs linting errors for staged files',
  handler: () => fork(resolveBin.sync('lint-staged'), ['.', '--config', resolve(__dirname, '../lint-staged.config.js')]),
  /*lintStaged({
    configPath: resolve(__dirname, '../lint-staged.config.js'),
  }),*/
  isEnabled: nodeEnv === 'development',
}
