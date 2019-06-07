const readPkgUp = require('read-pkg-up')
const path = require('path')

module.exports = () => readPkgUp()
  .then(({ path: packageConfigPath } = {}) => packageConfigPath !== undefined ? path.dirname(packageConfigPath) : undefined)
  .then(packagePath => packagePath !== undefined
    ? readPkgUp({ cwd: path.resolve(packagePath, '..') })
      .then(({ path: parentConfigPath, package: { workspaces, private: isPrivate } = {} } = {}) =>
        workspaces !== undefined && isPrivate ? path.dirname(parentConfigPath) : packagePath
      )
    : Promise.resolve()
  )
