const nodeEnv = require('@dword-design/node-env')
const fs = require('fs-extra')
const path = require('path')
const findUp = require('find-up')

module.exports = () => Promise.resolve()
  .then(() => console.log('Registering git hooks ...'))
  .then(() => nodeEnv === 'development'
    ? findUp('.git')
      .then(gitPath => gitPath !== undefined
        ? fs.exists(path.join(gitPath, 'hooks/pre-commit'))
          .then(gitHookExists => !gitHookExists
            ? fs.outputFile(
              path.resolve(gitPath, 'hooks/pre-commit'),
              endent`
                # base
                exec "${path.resolve(__dirname, 'cli.js')}" pre-commit
              `,
              { encoding: 'utf8', mode: '755' },
            )
            : undefined
        )
        : undefined
      )
    : undefined
  )
