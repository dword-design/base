const { fork } = require('child-process-promise')
const getActiveWorkspacePaths = require('../get-active-workspace-paths')
const path = require('path')

module.exports = {
  name: 'build',
  description: 'Builds the current workspace',
  handler: () => getActiveWorkspacePaths()
    .then(activeWorkspacePaths => Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(
          path.resolve(__dirname, '../run-workspace-command.js'),
          ['build'],
          { stdio: 'inherit', cwd: workspacePath },
        ))
    )),
}
