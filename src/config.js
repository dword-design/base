import importFrom from 'import-from'
import configPackageName from './config-package-name'
import { identity } from '@functions'

export default {
  depcheckConfig: {},
  gitignore: [],
  lint: identity,
  start: identity,
  ...importFrom(process.cwd(), configPackageName),
}
