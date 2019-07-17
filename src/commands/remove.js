const { spawn } = require('child-process-promise')
const nodeEnv = require('@dword-design/node-env')

module.exports = {
  name: 'remove [packages...]',
  desc: 'Remove dependencies',
  options: [
    { name: '-W, --ignore-workspace-root-check', desc: 'Ignore workspace root check' },
  ],
  handler: (packages, { ignoreWorkspaceRootCheck }) => spawn('yarn', ['remove', ...packages, ...ignoreWorkspaceRootCheck ? ['-W'] : []], { stdio: 'inherit'}),
  isEnabled: nodeEnv === 'development',
}
