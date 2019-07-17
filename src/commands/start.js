const path = require('path')
const { fork } = require('child-process-promise')
const findActiveWorkspacePaths = require('../find-active-workspace-paths')
const findVariables = require('../find-variables')
const findBasePath = require('../find-base-path')

module.exports = {
  name: 'start',
  desc: 'Starts the current workspace',
  handler: () => Promise.all([findVariables(), findBasePath(), findActiveWorkspacePaths()])
    .then(([variables, basePath, activeWorkspacePaths]) => Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(
          path.resolve(basePath, 'src/run-workspace-command.js'),
          ['start'],
          {
            stdio: 'inherit',
            cwd: workspacePath,
            env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: JSON.stringify(variables) },
          },
        ))
    )),
}
