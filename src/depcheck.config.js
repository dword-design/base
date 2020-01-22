import config from '@dword-design/base-config'
import { merge } from '@dword-design/functions'
import P from 'path'

const baseConfig = require(P.resolve('package.json')).baseConfig
const ignoreMatches = (typeof baseConfig === 'string' ? undefined : baseConfig?.depcheckConfig?.ignoreMatches) ?? []

export default {
  ignores: [
    config.name,
    ...ignoreMatches,
  ],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['package.json', 'src/**'],
}
  |> merge(config.depcheckConfig)
