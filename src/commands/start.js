const { fork } = require('child-process-promise')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')

module.exports = {
  name: 'start',
  description: 'Starts workspaces',
  handler: () => {
    const activeWorkspacePaths = getActiveWorkspacePaths()
    return Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(require.resolve('../run-workspace-command'), ['start'], { cwd: workspacePath }))
    )
  },
}
