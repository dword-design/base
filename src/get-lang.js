const resolveDep = require('resolve-dep')
const first = require('@dword-design/functions/first')

module.exports = () => {
  const lang = first(resolveDep(['base-lang-*', '@*/base-lang-*']))
  return lang !== undefined ? require(lang) : undefined
}
