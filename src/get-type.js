const importFrom = require('import-from')

module.exports = typeName => {
  const packageName = `@dword-design/base-type-${typeName}`
  return importFrom.silent(process.cwd(), packageName) || require(packageName)
}
