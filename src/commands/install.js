const { spawn } = require('child-process-promise')
const postinstall = require('../postinstall')

module.exports = {
  name: 'install',
  description: 'Installs dependencies, copies config files and registers git hooks',
  handler: () => Promise.resolve()
    .then(() => spawn('yarn', { stdio: 'inherit' }))
    .then(() => postinstall())
}
