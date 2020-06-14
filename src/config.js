import depcheckConfig from '@dword-design/depcheck-config'
import { identity } from '@dword-design/functions'
import P from 'path'
import resolveFrom from 'resolve-from'
import safeRequire from 'safe-require'

import name from './config-name'

const config = require(resolveFrom(process.cwd(), name))
const baseConfig =
  safeRequire(P.join(process.cwd(), 'package.json'))?.baseConfig || {}
const testInContainer =
  typeof baseConfig === 'string' ? undefined : baseConfig?.testInContainer

export default {
  name,
  depcheckConfig,
  gitignore: [],
  prepare: identity,
  lint: identity,
  deployPlugins: [],
  deployAssets: [],
  deployEnv: {},
  commands: {},
  ...(testInContainer ? { testInContainer } : {}),
  ...config,
}
