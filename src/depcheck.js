#!/usr/bin/env node

const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
const depcheckBabelParser = require('./depcheck-babel-parser')
const depcheckSassParser = require('./depcheck-sass-parser')
const depcheckTypeSpecial = require('./depcheck-type-special')
const { chain, isEmpty, merge, mapValues } = require('lodash')
const getType = require('./get-type')
const getBaseConfig = require('./get-base-config')
const readPkgUp = require('read-pkg-up')

const { depcheckIgnores } = getBaseConfig()
const { depcheckConfig } = getType()
const packageName = readPkgUp.sync().package.name

depcheck(
  process.cwd(),
  (() => {
    const config = merge(
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
          depcheck.special.bin,
          depcheckTypeSpecial,
        ],
        ignoreMatches: depcheckIgnores,
        ignoreDirs: ['dist', 'dist-test'],
      },
      depcheckConfig,
    )
    return {
      ...config,
      ...config.parsers !== undefined
        ? {
          parsers: mapValues(
            config.parsers,
            parser => typeof parser === 'string' ? depcheck.parser[parser] : parser,
          )
        }
        : {},
    }
  })()
)
  .then(json => chain(json).omit('using').omitBy(isEmpty).value())
  .then(stats => {
    if (!isEmpty(stats)) {
      console.log(`${packageName}\r\n${prettyjson.render(stats)}`)
      process.exit(1)
    }
  })
