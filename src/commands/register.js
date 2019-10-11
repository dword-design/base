const copyFiles = require('../copy-files')
const registerGitHooks = require('../register-git-hooks')

module.exports = {
  name: 'register',
  description: 'Registers git hooks and generates various config files',
  handler: async ({ log } = {}) => {
    await registerGitHooks({ log })
    await copyFiles({ log })
  }
}
