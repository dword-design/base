const readPkgUp = require('read-pkg-up')
const path = require(path)

module.exports = readPkgUp()
  .then(({ path: packagePath }) => path.dirname(packagePath))
