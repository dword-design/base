const getTarget = require('../get-target')

module.exports = {
  name: 'start',
  description: 'Starts the package',
  handler: async ({ log }) => {
    const { start } = getTarget()
    await start({ log })
  },
}
