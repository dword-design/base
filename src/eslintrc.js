const aliases = require('./aliases.config')
const { resolve } = require('path')

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parserOptions: {
    parser: require.resolve('babel-eslint'),
    sourceType: 'module',
    babelOptions: {
      configFile: resolve(__dirname, 'babel.config.js'),
    },
  },
  extends: [
    'eslint:recommended',
    'plugin:lodash-fp/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:vue/essential',
  ],
  plugins: [
    'react',
    'prefer-arrow',
  ],
  settings: {
    'import/resolver': {
      [require.resolve('eslint-import-resolver-babel-module')]: {
        alias: aliases,
      },
    },
  },
  rules: {
    'no-console': 0,
    indent: [
      'error',
      2,
      { SwitchCase: 1 },
    ],
    'linebreak-style': [
      'error',
      'unix'
    ],
    quotes: [
      'error',
      'single'
    ],
    semi: [
      'error',
      'never'
    ],
    'comma-dangle': [
      'error',
      'always-multiline'
    ],
    'arrow-parens': ['error', 'as-needed'],
    'prefer-arrow/prefer-arrow-functions': ['error'],
    'no-unused-vars': [
      'error',
      { vars: 'all', args: 'after-used', ignoreRestSiblings: false }
    ],
    'no-var': 'error',
    'prefer-const': 'error',
    'react/jsx-no-undef': 'error',
    "react/jsx-uses-vars": 1,
    'lodash-fp/no-extraneous-iteratee-args': 'off',
    'import/no-extraneous-dependencies': 'error',
    'import/no-commonjs': 'error',
  },
}
