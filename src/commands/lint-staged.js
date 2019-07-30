const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const { spawn } = require('child-process-promise')
const findBasePath = require('../find-base-path')

module.exports = {
  name: 'lint-staged',
  description: 'Outputs linting errors for staged files',
  handler: () => findBasePath()
    .then(basePath => spawn(
      path.resolve(basePath, 'node_modules/.bin/lint-staged'),
      ['.', '--config', path.resolve(basePath, 'src/lint-staged.config.js')],
      { stdio: 'inherit' },
    )),
  isEnabled: nodeEnv === 'development',
}
