const nodeEnv = require('@dword-design/node-env')
const fs = require('fs-extra')
const path = require('path')
const findRootPath = require('./find-root-path')

module.exports = () => Promise.resolve()
  .then(() => console.log('Registering git hooks ...'))
  .then(() => nodeEnv === 'development'
    ? findRootPath()
      .then(rootPath => fs.exists(path.join(rootPath, '.git'))
        .then(gitExists => gitExists
          ? fs.outputFile(
            path.resolve(rootPath, '.git/hooks/pre-commit'),
            `exec "${path.resolve(__dirname, 'cli.js')}" pre-commit`,
            { encoding: 'utf8', mode: '755' },
          )
          : undefined
        )
      )
    : undefined
  )
