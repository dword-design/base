const { fork } = require('child-process-promise')
const findActiveWorkspacePaths = require('../find-active-workspace-paths')
const path = require('path')
const findBasePath = require('../find-base-path')
const findVariables = require('../find-variables')

module.exports = {
  name: 'build',
  desc: 'Builds the current workspace',
  handler: () => Promise.all([findVariables(), findBasePath(), findActiveWorkspacePaths()])
    .then(([variables, basePath, activeWorkspacePaths]) => Promise.all(
      activeWorkspacePaths
        .map(workspacePath => fork(
          path.resolve(basePath, 'src/run-workspace-command.js'),
          ['build'],
          {
            stdio: 'inherit',
            cwd: workspacePath,
            env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: JSON.stringify(variables) },
          },
        ))
    )),
}
