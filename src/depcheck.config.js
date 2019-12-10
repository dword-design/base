import depcheckBabelParser from './depcheck-babel-parser'
import depcheckSpawnDetector from './depcheck-spawn-detector'
import { getStandard as getStandardAliases, getForTests as getAliasesForTests } from '@dword-design/aliases'
import { keys } from '@functions'
import configPackageName from './config-package-name'
import depcheck from 'depcheck'

export default {
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
    configPackageName,
    ...getStandardAliases() |> keys,
    ...getAliasesForTests() |> keys,
  ],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
}
