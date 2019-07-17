const readPkgUp = require('read-pkg-up')
const getType = require('./get-type')
const { omit } = require('lodash')

module.exports = () => {
  const config = { typeName: 'lib', ...readPkgUp.sync().package || {} }
  return { ...omit(config, 'typeName'), type: getType(config.typeName) }
}
