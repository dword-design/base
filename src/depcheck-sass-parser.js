const path = require('path')
const lodash = require('lodash')
const tildeImporter = require('node-sass-tilde-importer')
const sass = require('node-sass')
const getVariables = require('./get-variables')
const convertJsToSass = require('@epegzz/sass-vars-loader/src/utils/convertJsToSass')
const { paramCase } = require('change-case')
const readPkgUp = require('read-pkg-up')

module.exports = (content, filePath) => {
  const variables = getVariables()
  const sassVariablesString = convertJsToSass(lodash.mapKeys(variables, (_, name) => paramCase(name)))
  const { stats } = sass.renderSync({
    file: filePath,
    data: `${sassVariablesString}\r\n${content}`,
    includePaths: [path.dirname(filePath)],
    importer: (url, prev, done) => ({ ...tildeImporter(url, prev, done), contents: '' }),
  })

  return lodash(stats.includedFiles)
    .filter(file => file.includes('node_modules'))
    .map(file => readPkgUp.sync({ cwd: file }).package.name)
    .uniq()
    .value()
}
