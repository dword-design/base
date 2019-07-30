const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'outdated',
  description: 'Lists outdated dependencies',
  handler: () => spawn('yarn', ['outdated'], { stdio: 'inherit' }),
  isEnabled: nodeEnv === 'development',
}
