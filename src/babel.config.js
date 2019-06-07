const { path: variablesPath } = require('./variables')
const readPkgUp = require('read-pkg-up')
const getType = require('./get-type')
const babelMerge = require('babel-merge')

const { package: { typeName = 'lib' } } = readPkgUp.sync()
const type = getType(typeName)

module.exports = babelMerge(
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
        alias: {
          '@variables': variablesPath,
        },
      }]
    ],
  },
  type.babelConfig,
)
