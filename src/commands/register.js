const copyFiles = require('../copy-files')
const registerGitHooks = require('../register-git-hooks')

module.exports = {
  name: 'register',
  description: 'Registers git hooks and generates gitignore and editorconfig files',
  handler: () => Promise.resolve()
    .then(copyFiles)
    .then(registerGitHooks),
}
