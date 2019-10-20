const resolveDep = require('resolve-dep')
const NoLangError = require('./no-lang-error')

module.exports = () => {
  const lang = resolveDep(['base-lang-*', '@*/base-lang-*'])[0]
  return {
    eslintConfig: {
      env: {
        browser: true,
        es6: true,
        node: true,
      },
      extends: 'eslint:recommended',
    },
    ...lang !== undefined ? require(lang) : {},
  }
}
