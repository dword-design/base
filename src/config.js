import importFrom from 'import-from'
import configPackageName from './config-package-name'

export default importFrom(process.cwd(), configPackageName)
