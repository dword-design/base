const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'add [packages...]',
  desc: 'Add dependencies',
  options: [
    { short: '-W', long: '--ignore-workspace-root-check', desc: 'Ignore workspace root check' },
  ],
  handler: (packages, { W }) => spawn('yarn', ['add', ...packages, ...W ? ['-W'] : []], { stdio: 'inherit'}),
  isEnabled: nodeEnv === 'development',
}
