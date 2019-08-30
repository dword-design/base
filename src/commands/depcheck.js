const { fork } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')

module.exports = {
  name: 'depcheck',
  description: 'Outputs unused dependencies',
  handler: () => getActiveWorkspacePaths({ includeRoot: true })
    .then(activeWorkspacePaths => Promise.all(
      activeWorkspacePaths.map(workspacePath =>
        fork(path.resolve(__dirname, '../depcheck.js'), { cwd: workspacePath })
          .then(() => console.log())
      )
    )),
  isEnabled: nodeEnv === 'development',
}
