import configPackageName from './config-package-name'
import config from './config'
import { merge } from '@functions'

export default {
  ignoreMatches: [
    'pre-commit',
    configPackageName,
  ],
  ignoreDirs: ['.nyc_output', '.vscode', 'coverage', 'dist'],
}
  |> merge(config.depcheckConfig)
