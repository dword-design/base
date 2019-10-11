const { readFileSync } = require('safe-readfile')

module.exports = () => [
  ...require('./gitignore.default'),
  ...(readFileSync('.base.gitignore', 'utf8') || '').split('\n'),
]
