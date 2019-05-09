export default {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/essential',
    'plugin:lodash-fp/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: [
    'react',
    'prefer-arrow',
  ],
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
  }
}
