const babelMerge = require('babel-merge')
const getAliases = require('./get-aliases')
const getType = require('./get-type')

const type = getType()

module.exports = babelMerge(...[
  {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 10,
          },
        },
      ],
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-optional-chaining'),
      require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      [require.resolve('@babel/plugin-proposal-pipeline-operator'), { proposal: 'fsharp' }],
      require.resolve('@babel/plugin-proposal-object-rest-spread'),
      [require.resolve('babel-plugin-module-resolver'), { alias: getAliases() }],
    ],
  },
  ...type.babelConfig !== undefined ? [type.babelConfig] : [],
])
