import { identity } from '@dword-design/functions'
import depcheck from 'depcheck'
import depcheckDetectorExeca from 'depcheck-detector-execa'
import depcheckParserBabel from 'depcheck-parser-babel'
import importCwd from 'import-cwd'

import depcheckSpecialBaseConfig from './depcheck-special-base-config'
import packageBaseConfig from './package-base-config'

const baseConfig = importCwd(packageBaseConfig.name)

export default {
  commands: {},
  deployAssets: [],
  deployEnv: {},
  deployPlugins: [],
  editorIgnore: [],
  gitignore: [],
  lint: identity,
  prepare: identity,
  ...baseConfig,
  ...packageBaseConfig,
  depcheckConfig: {
    ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist', '.nuxt'],
    ignores:
      (typeof baseConfig === 'string'
        ? undefined
        : packageBaseConfig.depcheckConfig?.ignoreMatches) || [],
    prodDependencyMatches: ['!**/*.spec.js'],
    ...baseConfig.depcheckConfig,
    detectors: [
      depcheck.detector.importDeclaration,
      depcheck.detector.requireCallExpression,
      depcheck.detector.requireResolveCallExpression,
      depcheckDetectorExeca,
      ...(baseConfig.depcheckConfig?.detectors || []),
    ],
    parsers: {
      '*.js': depcheckParserBabel,
      ...baseConfig.depcheckConfig?.parsers,
    },
    specials: [
      depcheckSpecialBaseConfig,
      depcheck.special.bin,
      ...(baseConfig.depcheckConfig?.specials || []),
    ],
  },
}
