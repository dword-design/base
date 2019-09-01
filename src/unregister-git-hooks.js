const nodeEnv = require('@dword-design/node-env')
const fs = require('fs-extra')
const path = require('path')
const endent = require('endent')
const getRootPath = require('./get-root-path')
const { remove } = require('fs-extra')
const { readFileSync } = require('safe-readfile')
const { gitHookIdentifier } = require('./variables')

module.exports = () => nodeEnv === 'development'
  ? getRootPath()
    .then(rootPath => rootPath !== undefined
      ? Promise.resolve()
        .then(() => console.log('Unregistering git hooks ...'))
        .then(() => (readFileSync(path.join(rootPath, '.git/hooks/pre-commit')) || '').includes(gitHookIdentifier)
          ? remove(path.join(rootPath, '.git/hooks/pre-commit'))
          : undefined
        )
      : undefined
    )
  : undefined
