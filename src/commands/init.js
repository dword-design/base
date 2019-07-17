const install = require('./install')
const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'init',
  desc: 'Init a directory to be based',
  options: [
    { short: '-y', long: '--yes', desc: 'Execute the command without asking' },
  ],
  handler: ({ Y }) => spawn('yarn', ['init', ...Y ? ['-y'] : []], { stdio: 'inherit'})
    .then(() => install.handler()),
  isEnabled: nodeEnv === 'development',
}
