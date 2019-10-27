#!/usr/bin/env node

(async () => {
  const depcheck = require('depcheck')
  const depcheckBabelParser = require('./depcheck-babel-parser')
  const P = require('path')

  const noIssue = result => {
    return result.dependencies.length === 0
      && result.devDependencies.length === 0
      && Object.keys(result.missing).length === 0
  }

  const prettify = (caption, deps) => {
    const list = deps.map(dep => `* ${dep}`)
    return list.length ? [caption].concat(list) : []
  }

  const result = await depcheck(
    process.cwd(),
    {
      detectors: [
        depcheck.detector.importDeclaration,
        depcheck.detector.requireCallExpression,
        depcheck.detector.requireResolveCallExpression,
      ],
      parsers: {
        '*.js': depcheckBabelParser,
      //   '*.scss': depcheckSassParser,
      },
      specials: [
        depcheck.special.bin,
      ],
      ignoreMatches: [require(P.resolve('package.json')).name],
      ignoreDirs: ['dist'],
    }
  )

  if (noIssue(result)) {
    console.log('No depcheck issue')
  } else {
    const deps = prettify('Unused dependencies', result.dependencies)
    const devDeps = prettify('Unused devDependencies', result.devDependencies)
    const missing = prettify('Missing dependencies', Object.keys(result.missing))
    console.error(deps.concat(devDeps, missing).join('\n'))
    process.exit(1)
  }
})()
