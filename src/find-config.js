const readPkgUp = require('read-pkg-up')
const safeRequire = require('safe-require')
const path = require('path')

module.exports = () => readPkgUp()
  .then(({ path: packageJsonPath }) => ({
      activeWorkspaces: [],
      ...safeRequire(path.join(path.dirname(packageJsonPath), 'base.config.js')),
  }))
