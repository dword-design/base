const readPkgUp = require('read-pkg-up')
const importFrom = require('import-from')

module.exports = () => {
  const config = { typeName: 'lib', ...(readPkgUp.sync() || {}).package || {} }
  const packageName = `@dword-design/base-type-${config.typeName}`
  return importFrom.silent(process.cwd(), packageName) || require(packageName)
}
