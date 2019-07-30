const nodeEnv = require('@dword-design/node-env')
const lintStaged = require('./lint-staged')
const depcheck = require('./depcheck')

module.exports = {
  name: 'pre-commit',
  description: 'Runs commands before committing',
  handler: () => Promise.resolve()
    .then(lintStaged.handler)
    .then(depcheck.handler),
  isEnabled: nodeEnv === 'development',
}
