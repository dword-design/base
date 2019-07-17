const path = require('path')
const fs = require('fs-extra')
const findRootPath = require('./find-root-path')
const findBasePath = require('./find-base-path')

module.exports = () => Promise.resolve()
  .then(() => console.log('Copying files ...'))
  .then(() => Promise.all([findRootPath(), findBasePath()]))
  .then(([rootPath, basePath]) => Promise.all([
    fs.copyFile(path.resolve(basePath, 'src/editorconfig'), path.resolve(rootPath, '.editorconfig')),
    fs.exists(path.resolve(rootPath, '.base.gitignore'))
      .then(baseGitignoreExists => [
        ...require('./gitignore'),
        ...baseGitignoreExists ? [fs.readFileSync(path.resolve(rootPath, '.base.gitignore'))] : [],
      ])
      .then(parts => fs.outputFile(path.resolve(rootPath, '.gitignore'), parts.join('\r\n'), 'utf8')),
  ]))
