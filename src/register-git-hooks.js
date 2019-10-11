const nodeEnv = require('@dword-design/node-env')
const path = require('path')
const endent = require('endent')
const { exists, outputFile, readFile } = require('fs-extra')
const { gitHookIdentifier } = require('./variables')

module.exports = async ({ log } = {}) => {
  if (nodeEnv === 'development'
    && await exists('.git')
    && (
      !await exists('.git/hooks/pre-commit')
      || (await readFile('.git/hooks/pre-commit', 'utf8')).includes(gitHookIdentifier)
    )
  ) {
    if (log) {
      console.log('Registering git hooks …')
    }
    await outputFile(
      '.git/hooks/pre-commit',
      endent`
        ${gitHookIdentifier}
        exec npx base pre-commit
      `,
      { encoding: 'utf8', mode: '755' },
    )
  }
}
