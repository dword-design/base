const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'remove [packages...]',
  desc: 'Remove dependencies',
  options: [
    { short: '-W', long: '--ignore-workspace-root-check', desc: 'Ignore workspace root check' },
  ],
  handler: (packages, { W }) => spawn('yarn', ['remove', ...packages, ...W ? ['-W'] : []], { stdio: 'inherit'}),
  isEnabled: nodeEnv === 'development',
}
