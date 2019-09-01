const nodeEnv = require('@dword-design/node-env')
const { resolve } = require('path')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')
const { map } = require('lodash')
const { fork } = require('child-process-promise')
const allSettled = require('../all-settled')

module.exports = {
  name: 'lint',
  description: 'Outputs linting errors',
  handler: () => {
    const workspacePaths = getActiveWorkspacePaths()
    return allSettled(
      map(workspacePaths, workspacePath => fork(resolve(__dirname, '../eslint.js'), { cwd: workspacePath })),
    )
  },
  isEnabled: nodeEnv === 'development',
}
