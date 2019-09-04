const path = require('path')
const { fork } = require('child-process-promise')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')

module.exports = {
  name: 'test',
  description: 'Tests workspaces',
  handler: () => {
    const activeWorkspacePaths = getActiveWorkspacePaths()
    return Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(path.resolve(__dirname, '../test.js'), { cwd: workspacePath }))
    )
  },
}
