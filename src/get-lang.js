const resolveDep = require('resolve-dep')
const NoLangError = require('./no-lang-error')

module.exports = () => {
  const lang = resolveDep(['base-lang-*', '@*/base-lang-*'])[0]

  if (lang === undefined) {
    throw new NoLangError()
  }

  return require(lang)
}
