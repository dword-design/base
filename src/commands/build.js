const { fork } = require('child-process-promise')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')

module.exports = {
  name: 'build',
  description: 'Builds the current workspace',
  handler: () => {
    const activeWorkspacePaths = getActiveWorkspacePaths()
    return Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(
          require.resolve('../run-workspace-command'),
          ['build'],
          { cwd: workspacePath },
        ))
    )
  },
}
