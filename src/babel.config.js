const findWorkspaceConfig = require('./find-workspace-config')
const babelMerge = require('babel-merge')
const aliases = require('./aliases.config')

const { type } = findWorkspaceConfig()

module.exports = babelMerge(...[
  {
    presets: [
      require.resolve('@babel/preset-env'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      [require.resolve('@babel/plugin-proposal-pipeline-operator'), { proposal: 'minimal' }],
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      [require.resolve('babel-plugin-module-resolver'), {
        alias: aliases,
      }]
    ],
  },
  ...type.babelConfig !== undefined ? [type.babelConfig] : [],
])
