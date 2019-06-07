const { path: variablesPath } = require('./variables')
const readPkgUp = require('read-pkg-up')
const getTypePath = require('./get-type-path')
const babelMerge = require('babel-merge')
const path = require('path')
const safeRequire = require('safe-require')

const { package: { typeName = 'lib' } } = readPkgUp.sync()
const typePath = getTypePath(typeName)
const typeBabelConfig = safeRequire(path.join(typePath, 'src/babel.config.js'))

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
        alias: {
          '@variables': variablesPath,
        },
      }]
    ],
  },
  ...typeBabelConfig !== undefined ? [typeBabelConfig] : [],
])
