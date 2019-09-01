const unregisterGitHooks = require('../unregister-git-hooks')

module.exports = {
  name: 'unregister',
  description: 'Unregisters git hooks',
  handler: unregisterGitHooks,
}
