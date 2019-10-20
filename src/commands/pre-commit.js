const nodeEnv = require('@dword-design/node-env')
const { handler: lint } = require('./lint')
const { handler: depcheck } = require('./depcheck')
const { handler: test } = require('./test')

module.exports = {
  name: 'pre-commit',
  description: 'Runs commands before committing',
  handler: async ({ log } = {}) => {
    await lint({ log })
    // await depcheck()
    // await test()
  },
  isEnabled: nodeEnv === 'development',
}
