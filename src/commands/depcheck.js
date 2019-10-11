const { fork } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')
const allSettled = require('../all-settled')

module.exports = {
  name: 'depcheck',
  description: 'Outputs unused dependencies',
  handler: () => {
    return allSettled(
      activeWorkspacePaths.map((workspacePath, index) =>
        fork(require.resolve('../depcheck'), { cwd: workspacePath })
          .catch(err => { if (index < activeWorkspacePaths - 1) console.log(); throw err })
      )
    )
  },
  isEnabled: nodeEnv === 'development',
}
