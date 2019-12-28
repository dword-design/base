import config from '@dword-design/base-config'
import { merge } from '@dword-design/functions'
import P from 'path'

export default {
  ignoreMatches: [
    config.name,
    ...require(P.resolve('package.json')).depcheck?.ignoreMatches ?? [],
  ],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
  prodDependencyMatches: ['package.json', 'src/**'],
}
  |> merge(config.depcheckConfig)
