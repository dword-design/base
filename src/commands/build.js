const getPlugins = require('../get-plugins')
const { handler: lint } = require('./lint')
const map = require('@dword-design/functions/map')
const promiseAll = require('@dword-design/functions/promiseAll')
const pipe = require('pipe-fns')

module.exports = {
  name: 'build',
  description: 'Builds the package',
  handler: async ({ log } = {}) => {
    if (log) {
      console.log('Building …')
    }
    await pipe(
      getPlugins(),
      map(({ build }) => build({ lint })),
      promiseAll,
    )
    if (log) {
      console.log('Build successful!')
    }
  },
}
