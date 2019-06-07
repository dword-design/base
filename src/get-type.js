const resolveFrom = require('resolve-from')
const { merge } = require('lodash')

module.exports = typeName => {
  const packageName = `@dword-design/base-type-${typeName}`
  const modulePath = resolveFrom(process.cwd(), packageName)
  const result = require(modulePath !== undefined ? modulePath : packageName)
  if (result !== undefined) {
    return merge(
      {},
      {
        eslint: {
          config: {},
          extensions: [],
        }
      },
      result,
    )
  }
}
