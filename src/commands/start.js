const getPlugins = require('../get-plugins')
const { handler: lint } = require('./lint')
const map = require('@dword-design/functions/map')
const promiseAll = require('@dword-design/functions/promiseAll')
const pipe = require('pipe-fns')

module.exports = {
  name: 'start',
  description: 'Starts the package',
  handler: async ({ log } = {}) => {
    const plugins = getPlugins()
    await pipe(
      getPlugins(),
      map(({ start }) => start({ lint })),
      promiseAll,
    )
  },
}
