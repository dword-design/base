const readPkgUp = require('read-pkg-up')
const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
const depcheckSassParser = require('./depcheck-sass-parser')
const depcheckTypeSpecial = require('./depcheck-type-special')
const { chain, isEmpty, merge } = require('lodash')
const getType = require('./get-type')

const { package: { typeName = 'lib' } = {} } = readPkgUp.sync()
const type = getType(typeName)

Promise.all([
  readPkgUp().then(({ package: { name } }) => name),
  depcheck(
    process.cwd(),
    merge(
      {
        detectors: [
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
        ],
        parsers: {
          '*.js': depcheck.parser.es7,
          '*.scss': depcheckSassParser,
        },
        specials: [
          depcheckTypeSpecial,
        ],
      },
      type.depcheckConfig,
    )
  )
    .then(json => chain(json).omit('using').omitBy(isEmpty).value()),
])
  .then(([packageName, stats]) => {
    if (!isEmpty(stats)) {
      console.log(`${packageName}\r\n${prettyjson.render(stats)}`)
    }
  })
