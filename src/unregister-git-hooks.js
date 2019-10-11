const nodeEnv = require('@dword-design/node-env')
const { remove } = require('fs-extra')
const { readFileSync } = require('safe-readfile')
const { gitHookIdentifier } = require('./variables')

module.exports = async ({ log } = {}) => {
  if (nodeEnv === 'development'
    && (readFileSync('.git/hooks/pre-commit', 'utf8') || '').includes(gitHookIdentifier)
  ) {
    if (log) {
      console.log('Unregistering git hooks …')
    }
    await remove('.git/hooks/pre-commit')
  }
}
