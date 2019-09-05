const nodeEnv = require('@dword-design/node-env')
const lintStaged = require('./lint-staged')
const depcheck = require('./depcheck')
const test = require('./test')

module.exports = {
  name: 'pre-commit',
  description: 'Runs commands before committing',
  handler: () => Promise.resolve()
    .then(lintStaged.handler)
    .then(depcheck.handler)
    .then(test.handler),
  isEnabled: nodeEnv === 'development',
}
