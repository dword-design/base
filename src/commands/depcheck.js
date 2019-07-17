const { fork } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const findBasePath = require('../find-base-path')
const findActiveWorkspacePaths = require('../find-active-workspace-paths')
const findVariables = require('../find-variables')

module.exports = {
  name: 'depcheck',
  desc: 'Outputs unused dependencies',
  handler: () => Promise.all([findBasePath(), findActiveWorkspacePaths({ includeRoot: true }), findVariables()])
    .then(([basePath, activeWorkspacePaths, variables]) => Promise.all(
      activeWorkspacePaths.map(workspacePath =>
        fork(
          path.resolve(basePath, 'src/depcheck.js'),
          { cwd: workspacePath, env: { ...process.env, BASE_PATH: basePath, BASE_VARIABLES: JSON.stringify(variables) } }
        )
          .then(() => console.log())
      )
    )),
  isEnabled: nodeEnv === 'development',
}
