import name from './config-name'
import depcheckConfig from '@dword-design/depcheck-config'
import resolveFrom from 'resolve-from'
import { identity } from '@dword-design/functions'
import safeRequire from 'safe-require'
import P from 'path'

const config = require(resolveFrom(process.cwd(), name))
const baseConfig = safeRequire(P.join(process.cwd(), 'package.json'))?.baseConfig ?? {}
const testInContainer = typeof baseConfig === 'string' ? undefined : baseConfig?.testInContainer

export default {
  name,
  depcheckConfig,
  gitignore: [],
  main: 'index.js',
  test: identity,
  commands: {},
  ...testInContainer ? { testInContainer } : {},
  ...config,
}
