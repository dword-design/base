const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
const depcheckBabelParser = require('./depcheck-babel-parser')
const depcheckSassParser = require('./depcheck-sass-parser')
const depcheckTypeSpecial = require('./depcheck-type-special')
const findWorkspaceConfig = require('./find-workspace-config')
const { chain, isEmpty, merge } = require('lodash')

const { type, name: packageName } = findWorkspaceConfig()

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
        '*.js': depcheckBabelParser,
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
  .then(json => chain(json).omit('using').omitBy(isEmpty).value())
  .then(stats => {
    if (!isEmpty(stats)) {
      console.log(`${packageName}\r\n${prettyjson.render(stats)}`)
      process.exit(1)
    }
  })
