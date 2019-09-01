const { fork } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')
const allSettled = require('../all-settled')

module.exports = {
  name: 'depcheck',
  description: 'Outputs unused dependencies',
  handler: () => {
    const activeWorkspacePaths = getActiveWorkspacePaths({ includeRoot: true })
    return allSettled(
      activeWorkspacePaths.map((workspacePath, index) =>
        fork(path.resolve(__dirname, '../depcheck.js'), { cwd: workspacePath })
          .catch(err => { if (index < activeWorkspacePaths - 1) console.log(); throw err })
      )
    )
  },
  isEnabled: nodeEnv === 'development',
}
