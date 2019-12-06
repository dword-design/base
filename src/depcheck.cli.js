#!/usr/bin/env node

import depcheck from 'depcheck'
import depcheckBabelParser from './depcheck-babel-parser'
import depcheckSpawnDetector from './depcheck-spawn-detector'
import { join } from 'path'
import { getStandard as getStandardAliases, getForTests as getAliasesForTests } from '@dword-design/aliases'
import { keys } from '@functions'
import safeRequire from 'safe-require'

(async () => {

  const packageName = safeRequire(join(process.cwd(), 'package.json'))?.name

  const noIssue = result => {
    return result.dependencies.length === 0
      && result.devDependencies.length === 0
      && keys(result.missing).length === 0
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
        depcheckSpawnDetector,
      ],
      parsers: {
        '*.js': depcheckBabelParser,
      },
      specials: [
        depcheck.special.bin,
      ],
      ignoreMatches: [
        'pre-commit',
        '@dword-design/babel-config',
        '@dword-design/eslint-config',
        ...getStandardAliases() |> keys,
        ...getAliasesForTests() |> keys,
      ],
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
