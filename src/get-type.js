const readPkgUp = require('read-pkg-up')

module.exports = () => {
  const config = { typeName: 'lib', ...(readPkgUp.sync() || {}).package || {} }
  return require(`@dword-design/base-type-${config.typeName}`)
}
