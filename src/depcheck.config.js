import configPackageName from './config-package-name'
import config from './config'
import { merge } from '@dword-design/functions'
import P from 'path'

export default {
  ignoreMatches: [
    configPackageName,
    ...require(P.resolve('package.json')).depcheck?.ignoreMatches ?? [],
  ],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
}
  |> merge(config.depcheckConfig)
