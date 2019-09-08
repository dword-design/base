const { fork } = require('child-process-promise')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')

module.exports = {
  name: 'test',
  description: 'Tests workspaces',
  handler: () => {
    const activeWorkspacePaths = getActiveWorkspacePaths()
    return Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(require.resolve('../test'), { cwd: workspacePath }))
    )
  },
}
