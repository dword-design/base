import importFrom from 'import-from'
import configPackageName from './config-package-name'
import { identity } from '@dword-design/functions'
import nodeConfig from '@dword-design/base-config-node'

export default {
  depcheckConfig: nodeConfig.depcheckConfig,
  gitignore: [],
  lint: identity,
  start: identity,
  ...importFrom(process.cwd(), configPackageName),
}
