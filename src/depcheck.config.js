import config from '@dword-design/base-config'
import { merge } from '@dword-design/functions'
import P from 'path'

const { baseConfig } = require(P.resolve('package.json'))
const ignoreMatches = (typeof baseConfig === 'string' ? undefined : baseConfig?.depcheckConfig?.ignoreMatches) ?? []

export default {
  ignores: ignoreMatches,
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['src/**'],
}
  |> merge(config.depcheckConfig)
