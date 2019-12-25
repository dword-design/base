import resolveFrom from 'resolve-from'
import configPackageName from './config-package-name'
import { identity } from '@dword-design/functions'
import nodeConfig from '@dword-design/base-config-node'

export default {
  babelConfig: nodeConfig.babelConfig,
  depcheckConfig: nodeConfig.depcheckConfig,
  gitignore: [],
  lint: identity,
  build: identity,
  start: identity,
  ...require(resolveFrom(process.cwd(), configPackageName)),
}
