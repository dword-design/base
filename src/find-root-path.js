const readPkgUp = require('read-pkg-up')
const path = require('path')

module.exports = () => readPkgUp()
  .then(({ path: packagePath } = {}) => packagePath !== undefined
    ? readPkgUp({ cwd: path.resolve(packagePath, '..') })
      .then(({ path: parentPath, package: { workspaces, private: isPrivate } = {} } = {}) =>
        path.dirname(workspaces !== undefined && isPrivate ? parentPath : packagePath)
      )
    : Promise.resolve()
  )
