const resolveDep = require('resolve-dep')
const NoLangError = require('./no-lang-error')

module.exports = () => {
  const lang = resolveDep(['base-lang-*', '@*/base-lang-*'])[0]

  return lang !== undefined ? require(lang) : undefined
}
