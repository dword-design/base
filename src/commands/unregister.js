const unregisterGitHooks = require('../unregister-git-hooks')
const loadPkg = require('load-pkg')
const readPkgUp = require('read-pkg-up')

module.exports = {
  name: 'unregister',
  description: 'Unregisters git hooks',
  handler: async ({ log } = {}) => {
    if ((await readPkgUp() || {}).package.name !== (await readPkgUp({ cwd: __dirname })).package.name) {
      await unregisterGitHooks({ log })
    }
  },
}
