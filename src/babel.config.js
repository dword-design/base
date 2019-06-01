const findUpSync = require('findup-sync')

const variablesPath = findUpSync('variables.base.js')

module.exports = {
  presets: [
    '@babel/preset-env',
    '@vue/babel-preset-jsx',
  ],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
    '@babel/plugin-proposal-object-rest-spread',
    ['babel-plugin-module-resolver', {
      alias: {
        '@variables': variablesPath,
      },
    }]
  ],
}
