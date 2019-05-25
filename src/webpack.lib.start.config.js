const webpackMerge = require('webpack-merge')
const moduleExists = require('module-exists')
const baseConfig = require('./webpack.lib.config')
const WebpackShellPlugin = require('webpack-shell-plugin')
const path = require('path')

module.exports = webpackMerge(
  baseConfig,
  {
    watchOptions: {
      ignored: /dist/,
    },
    plugins: [
      new WebpackShellPlugin({
        onBuildEnd: [{
          command: path.resolve(__dirname, '../node_modules/.bin/nodemon'),
          args: ['dist/index.js', '--watch', 'dist'],
        }],
      })
    ],
  }
)
