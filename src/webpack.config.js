const nodeExternals = require('webpack-node-externals')
const path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = {
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
  externals: [nodeExternals()],
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
}
