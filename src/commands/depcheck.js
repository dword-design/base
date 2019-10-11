const nodeEnv = require('@dword-design/node-env')
const depcheck = require('../depcheck')

module.exports = {
  name: 'depcheck',
  description: 'Outputs unused dependencies',
  handler: ({ log } = {}) => depcheck({ log }),
  isEnabled: nodeEnv === 'development',
}
