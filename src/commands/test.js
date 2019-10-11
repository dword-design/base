const { fork } = require('child-process-promise')

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
