#!/usr/bin/env node

const depcheck = require('depcheck')
const prettyjson = require('prettyjson')
// const depcheckBabelParser = require('./depcheck-babel-parser')
// const depcheckSassParser = require('./depcheck-sass-parser')
const omit = require('@dword-design/functions/omit')
const omitBy = require('@dword-design/functions/omitBy')
const isEmpty = require('@dword-design/functions/isEmpty')
const pipe = require('pipe-fns')

module.exports = async ({ log }) => {
  const json = await depcheck(
    process.cwd(),
    {
      detectors: [
        depcheck.detector.importDeclaration,
        depcheck.detector.requireCallExpression,
        depcheck.detector.requireResolveCallExpression,
      ],
      // parsers: {
      //   '*.js': depcheckBabelParser,
      //   '*.scss': depcheckSassParser,
      // },
      specials: [
        depcheck.special.bin,
      ],
      ignoreDirs: ['dist'],
    }
  )
  const stats = pipe(json, omit('using'), omitBy(isEmpty))
  if (!isEmpty(stats) && log) {
    console.log(prettyjson.render(stats))
  }
}
