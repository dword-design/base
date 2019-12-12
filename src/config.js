import importFrom from 'import-from'
import configPackageName from './config-package-name'
import { identity } from '@dword-design/functions'

export default {
  depcheckConfig: {},
  gitignore: [],
  lint: identity,
  start: identity,
  ...importFrom(process.cwd(), configPackageName),
}
