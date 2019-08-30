const nodeEnv = require('@dword-design/node-env')
const { resolve } = require('path')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')
const { map } = require('lodash')
const { fork } = require('child-process-promise')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: () => getActiveWorkspacePaths()
    .then(workspacePaths => Promise.all(
      map(workspacePaths, workspacePath => fork(
        resolve(__dirname, '../eslint.js'),
        { stdio: 'inherit', cwd: workspacePath },
      )),
    )),
  isEnabled: nodeEnv === 'development',
}
