const copyFiles = require('./copy-files')
const registerGitHooks = require('./register-git-hooks')

module.exports = () => Promise.resolve()
  .then(copyFiles)
  .then(registerGitHooks)
