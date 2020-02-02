import config from './config'
import P from 'path'
import baseConfigSpecial from './depcheck-base-config-special'

const { baseConfig } = require(P.resolve('package.json'))

export default {
  ignores: (typeof baseConfig === 'string'
    ? undefined
    : baseConfig?.depcheckConfig?.ignoreMatches
  ) ?? [],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['src/**'],
  ...config.depcheckConfig,
  specials: [
    baseConfigSpecial,
    ...config.depcheckConfig.specials ?? [],
  ],
}
