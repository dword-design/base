import config from './config'
import P from 'path'
import baseConfigSpecial from './depcheck-base-config-special'
import safeRequire from 'safe-require'

const baseConfig = safeRequire(P.join(process.cwd(), 'package.json'))?.baseConfig

export default {
  ignores: (typeof baseConfig === 'string'
    ? undefined
    : baseConfig?.depcheckConfig?.ignoreMatches
  ) ?? [],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['!**/*.spec.js'],
  ...config.depcheckConfig,
  specials: [
    baseConfigSpecial,
    ...config.depcheckConfig.specials ?? [],
  ],
}
