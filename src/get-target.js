const resolveDep = require('resolve-dep')
const NoTargetError = require('./no-target-error')

module.exports = () => {
  const target = resolveDep(['base-target-*', '@*/base-target-*'])[0]

  if (target === undefined) {
    throw new NoTargetError()
  }

  return require(target)
}
