import P from 'path'
import safeRequire from 'safe-require'

import config from './config'
import depcheckSpecialBaseConfig from './depcheck-special-base-config'

const baseConfig = safeRequire(P.join(process.cwd(), 'package.json'))
  ?.baseConfig

export default {
  ignores:
    (typeof baseConfig === 'string'
      ? undefined
      : baseConfig?.depcheckConfig?.ignoreMatches) || [],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['!**/*.spec.js'],
  ...config.depcheckConfig,
  specials: [
    depcheckSpecialBaseConfig,
    ...(config.depcheckConfig.specials || []),
  ],
}
