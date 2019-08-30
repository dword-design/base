const findUp = require('find-up')
const babelRegister = require('@babel/register')
const babelConfig = require('./babel.config')

module.exports = () => {
  const baseConfigPath = findUp.sync('base.config.js')

  babelRegister({ ...babelConfig, ignore: [/node_modules/] })

  return {
    activeWorkspaces: [],
    ...baseConfigPath !== undefined ? require(baseConfigPath) : {},
  }
}
