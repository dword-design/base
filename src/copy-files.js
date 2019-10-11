const { resolve } = require('path')
const { copyFile, exists, readFile, outputFile } = require('fs-extra')
const getGitignore = require('./get-gitignore')

module.exports = async ({ log } = {}) => {
  if (log) {
    console.log('Copying files …')
  }
  await Promise.all([
    copyFile(resolve(__dirname, 'editorconfig'), '.editorconfig'),
    outputFile('.gitignore', getGitignore().join('\n')),
  ])
}
