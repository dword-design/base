import depcheckConfig from '@dword-design/depcheck-config'
import { identity } from '@dword-design/functions'
import importCwd from 'import-cwd'

import packageBaseConfig from './package-base-config'

export default {
  depcheckConfig,
  gitignore: [],
  editorIgnore: [],
  prepare: identity,
  lint: identity,
  deployPlugins: [],
  deployAssets: [],
  deployEnv: {},
  commands: {},
  ...importCwd(packageBaseConfig.name),
  ...packageBaseConfig,
}
