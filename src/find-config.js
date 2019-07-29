const findUp = require('find-up')
const babelRegister = require('@babel/register')
const path = require('path')

module.exports = () => findUp('base.config.js')
  .then(configPath => {

    babelRegister({
      configFile: path.resolve(__dirname, 'babel.config.js'),
      ignore: [/node_modules/],
    })

    return {
      activeWorkspaces: [],
      ...configPath !== undefined ? require(configPath) : {},
    }
  })
