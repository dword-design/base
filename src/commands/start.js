const getPlugins = require('../get-plugins')
const { handler: lint } = require('./lint')
const map = require('@dword-design/functions/map')
const promiseAll = require('@dword-design/functions/promiseAll')
const noop = require('@dword-design/functions/noop')
const pipe = require('pipe-fns')

module.exports = {
  name: 'start',
  description: 'Starts the package',
  handler: ({ log } = {}) => pipe(
    getPlugins(),
    map(({ start }) => (start || noop)({ lint })),
    promiseAll,
  ),
}
