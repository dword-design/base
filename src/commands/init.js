const install = require('./install')
const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'init',
  description: 'Init a directory to be based',
  options: [
    { name: '-y, --yes', description: 'Execute the command without asking' },
  ],
  handler: ({ yes }) => spawn('yarn', ['init', ...yes ? ['-y'] : []], { stdio: 'inherit' })
    .then(() => install.handler()),
  isEnabled: nodeEnv === 'development',
}
