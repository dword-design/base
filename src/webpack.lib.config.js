const nodeExternals = require('webpack-node-externals')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackMerge = require('webpack-merge')
const moduleExists = require('module-exists')
const additionalConfig = moduleExists(path.resolve(process.cwd(), 'webpack.config.js'))
  ? require(path.resolve(process.cwd(), 'webpack.config.js'))
  : {}

module.exports = webpackMerge(
  {
    target: 'node',
    context: process.cwd(),
    mode: process.env.NODE_ENV || 'development',
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: 'index.js',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'this',
    },
    externals: [nodeExternals({ modulesFromFile: true })],
    plugins: [
      new CleanWebpackPlugin(),
    ],
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
          options: {
            configFile: path.resolve(__dirname, 'eslintrc.js'),
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, 'babel.config.js'),
          }
        },
      ],
    },
    node: {
      __dirname: false,
    },
  },
  additionalConfig,
)
