import name from './config-name'
import depcheckConfig from '@dword-design/depcheck-config'
import resolveFrom from 'resolve-from'
import { identity } from '@dword-design/functions'

const config = require(resolveFrom(process.cwd(), name))

export default {
  name,
  depcheckConfig,
  gitignore: [],
  main: 'index.js',
  test: identity,
  commands: {},
  ...config,
}
