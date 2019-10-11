const nodeEnv = require('@dword-design/node-env')
const { handler: lintStaged } = require('./lint-staged')
const { handler: depcheck } = require('./depcheck')
const { handler: test } = require('./test')

module.exports = {
  name: 'pre-commit',
  description: 'Runs commands before committing',
  handler: async () => {
    await lintStaged()
    await depcheck()
    await test()
  }
  isEnabled: nodeEnv === 'development',
}
