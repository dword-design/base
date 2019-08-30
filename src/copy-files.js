const { resolve } = require('path')
const fs = require('fs-extra')
const getRootPath = require('./get-root-path')
const findUp = require('find-up')

module.exports = () => Promise.resolve()
  .then(() => console.log('Copying files ...'))
  .then(() => getRootPath())
  .then(rootPath => Promise.all([
    fs.copyFile(resolve(__dirname, '../editorconfig'), resolve(rootPath, '.editorconfig')),
    findUp('.base.gitignore')
      .then(baseGitignorePath => [
        ...require('./gitignore'),
        ...baseGitignorePath !== undefined ? [fs.readFileSync(baseGitignorePath)] : [],
      ])
      .then(parts => fs.outputFile(resolve(rootPath, '.gitignore'), parts.join('\r\n'), 'utf8')),
  ]))
