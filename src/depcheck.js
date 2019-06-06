const readPkgUp = require('read-pkg-up')
const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
const depcheckSassParser = require('./depcheck-sass-parser')
const { chain, isEmpty } = require('lodash')

Promise.all([
  readPkgUp().then(({ package: { name } }) => name),
  depcheck(process.cwd(), {
    detectors: [
      depcheck.detector.importDeclaration,
      depcheck.detector.requireCallExpression,
    ],
    parsers: {
      '*.vue': depcheck.parser.vue,
      '*.js': depcheck.parser.es7,
      '*.scss': depcheckSassParser,
    },
  })
    .then(json => chain(json).omit('using').omitBy(isEmpty).value()),
])
  .then(([packageName, stats]) => {
    if (!isEmpty(stats)) {
      console.log(`${packageName}\r\n${prettyjson.render(stats)}`)
    }
  })
