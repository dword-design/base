const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
const depcheckSassParser = require('./depcheck-sass-parser')
const depcheckTypeSpecial = require('./depcheck-type-special')
const findWorkspaceConfig = require('./find-workspace-config')
const { chain, isEmpty, merge } = require('lodash')

const { type } = findWorkspaceConfig()

Promise.all([
  readPkgUp().then(({ package: { name } }) => name),
  depcheck(
    process.cwd(),
    merge(
      {
        detectors: [
          depcheck.detector.importDeclaration,
          depcheck.detector.requireCallExpression,
          depcheck.detector.requireResolveCallExpression,
        ],
        parsers: {
          '*.js': depcheck.parser.es7,
          '*.scss': depcheckSassParser,
        },
        specials: [
          depcheckTypeSpecial,
        ],
        ignoreDirs: ['dist'],
      },
      type.depcheckConfig,
    )
  )
    .then(json => chain(json).omit('using').omitBy(isEmpty).value()),
])
  .then(([packageName, stats]) => {
    if (!isEmpty(stats)) {
      console.log(`${packageName}\r\n${prettyjson.render(stats)}`)
      process.exit(1)
    }
  })
