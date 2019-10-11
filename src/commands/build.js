const getTarget = require('../get-target')

module.exports = {
  name: 'build',
  description: 'Builds the package',
  handler: async ({ log } = {}) => {
    const { build } = getTarget()
    if (log) {
      console.log('Building …')
    }
    await build()
    if (log) {
      console.log('Build successful!')
    }
  },
}
