const P = require('path')
const aliases = require('./aliases.config')
const babelConfig = require('./babel.config')

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    babelOptions: babelConfig,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: [
    'prefer-arrow',
    'import',
  ],
  settings: {
    'import/resolver': {
      'babel-module': { alias: aliases },
    },
    'import/core-modules': [require(P.resolve('package.json')).name],
  },
  rules: {
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
    'arrow-parens': ['error', 'as-needed'],
    'prefer-arrow/prefer-arrow-functions': ['error'],
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }],
    'no-var': 'error',
    'prefer-const': 'error',
    'import/no-extraneous-dependencies': 'error',
    'import/no-commonjs': 'error',
    'import/no-unresolved': ['error', { ignore: Object.keys(aliases) }]
  },
  overrides: [
    {
      files: ['**.test.js'],
      env: {
        mocha: true,
      },
      globals: {
        expect: 'readonly',
      },
      extends: ['plugin:mocha/recommended'],
      plugins: ['mocha'],
      rules: {
        'mocha/no-mocha-arrows': 'off',
        'mocha/no-global-tests': 'off',
      },
    },
  ],
}
