const registerGitHooks = require('../register-git-hooks')
const loadPkg = require('load-pkg')
const readPkgUp = require('read-pkg-up')

module.exports = {
  name: 'register',
  description: 'Registers git hooks and generates various config files',
  handler: async ({ log } = {}) => {
    if ((await readPkgUp() || {}).package.name !== (await readPkgUp({ cwd: __dirname })).package.name) {
      await registerGitHooks({ log })
    }
  }
}
