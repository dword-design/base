const { spawn } = require('child-process-promise')
const copyFiles = require('../copy-files')
const registerGitHooks = require('../register-git-hooks')

module.exports = {
  name: 'install',
  desc: 'Installs dependencies, copies config files and registers git hooks',
  handler: () => Promise.resolve()
    .then(() => spawn('yarn', { stdio: 'inherit'}))
    .then(copyFiles)
    .then(registerGitHooks)
}
