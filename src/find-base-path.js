const readPkgUp = require('read-pkg-up')
const path = require('path')

module.exports = () => readPkgUp({ cwd: __dirname })
  .then(({ path: packagePath }) => path.dirname(packagePath))
