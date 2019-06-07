const resolveFrom = require('resolve-from')
const readPkgUp = require('read-pkg-up')
const path = require('path')

module.exports = typeName => {
  const packageName = `@dword-design/base-type-${typeName}`
  const packagePath = resolveFrom.silent(process.cwd(), packageName)
  return path.dirname(
    readPkgUp.sync({ cwd: require.resolve(packagePath !== undefined ? packagePath : packageName) }).path
  )
}
