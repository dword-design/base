const resolveFrom = require('resolve-from')

module.exports = typeName => {
  const packageName = `@dword-design/base-type-${typeName}`
  const packagePath = resolveFrom.silent(process.cwd(), packageName)
  return require(packagePath !== undefined ? packagePath : packageName)
}
