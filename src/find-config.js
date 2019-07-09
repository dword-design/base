const findUp = require('find-up')
const safeRequire = require('safe-require')

module.exports = () => findUp('base.config.js')
  .then(configPath => ({
    activeWorkspaces: [],
    depgraphIgnores: [],
    ...safeRequire(configPath),
  }))
