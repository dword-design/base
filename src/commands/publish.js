const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')
const { handler: buildHandler } = require('./build')

module.exports = {
  name: 'publish',
  description: 'Publish the workspace to NPM',
  handler: () => buildHandler()
    .then(() => spawn('yarn', ['publish', '--access', 'public'], { stdio: 'inherit' })),
  isEnabled: nodeEnv === 'development',
}
