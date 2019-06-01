const nodeExternals = require('webpack-node-externals')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpackMerge = require('webpack-merge')
const moduleExists = require('module-exists')
const fs = require('fs-extra')
const nodeEnv = require('@dword-design/node-env')

const additionalConfig = moduleExists(path.resolve(process.cwd(), 'webpack.config.js'))
  ? require(path.resolve(process.cwd(), 'webpack.config.js'))
  : {}

const indexHtmlExists = fs.existsSync(path.resolve(process.cwd(), 'index.html'))

module.exports = webpackMerge(
  {
    target: 'node',
    context: process.cwd(),
    mode: nodeEnv,
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
      ...indexHtmlExists
        ? [new HtmlWebpackPlugin({
          template : 'index.html',
          filename : 'index.html',
          hash     : false,
          inject   : false,
        })]
        : [],
    ],
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          loader: require.resolve('eslint-loader'),
          exclude: /node_modules/,
          options: {
            configFile: path.resolve(__dirname, 'eslintrc.js'),
          },
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: require.resolve('babel-loader'),
          options: {
            configFile: path.resolve(__dirname, 'babel.config.js'),
          },
        },
      ],
    },
    node: {
      __dirname: false,
    },
  },
  additionalConfig,
)
