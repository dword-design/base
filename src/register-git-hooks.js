const nodeEnv = require('@dword-design/node-env')
const fs = require('fs-extra')
const path = require('path')
const endent = require('endent')
const getRootPath = require('./get-root-path')
const { exists } = require('fs-extra')
const { gitHookIdentifier } = require('./variables')

module.exports = () => nodeEnv === 'development'
  ? getRootPath()
    .then(rootPath => rootPath !== undefined
      ? Promise.resolve()
        .then(() => console.log('Registering git hooks ...'))
        .then(() => exists(path.join(rootPath, '.git')))
        .then(isGitRepository => isGitRepository
          ? exists(path.join(rootPath, '.git/hooks/pre-commit'))
            .then(gitHookExists => !gitHookExists
              ? fs.outputFile(
                path.resolve(rootPath, '.git/hooks/pre-commit'),
                endent`
                  ${gitHookIdentifier}
                  exec "${path.resolve(__dirname, 'cli.js')}" pre-commit\n
                `,
                { encoding: 'utf8', mode: '755' },
              )
              : undefined
            )
          : undefined
        )
      : undefined
    )
  : undefined
