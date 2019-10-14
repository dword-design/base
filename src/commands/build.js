const getTarget = require('../get-target')
const { handler: lint } = require('./lint')

module.exports = {
  name: 'build',
  description: 'Builds the package',
  handler: async ({ log } = {}) => {
    const { build } = getTarget()
    if (log) {
      console.log('Building …')
    }
    await build({ lint })
    if (log) {
      console.log('Build successful!')
    }
  },
}
