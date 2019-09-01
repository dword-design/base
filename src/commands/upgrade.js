const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'upgrade [packages...]',
  description: 'Upgrade dependencies',
  handler: packages => spawn('yarn', ['upgrade', ...packages], { stdio: 'inherit' }),
  isEnabled: nodeEnv === 'development',
}
