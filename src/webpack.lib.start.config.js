const webpackMerge = require('webpack-merge')
const moduleExists = require('module-exists')
const baseConfig = require('./webpack.lib.config')
const WebpackShellPlugin = require('webpack-shell-plugin')

module.exports = webpackMerge(
  baseConfig,
  {
    watchOptions: {
      ignored: /dist/,
    },
    plugins: [
      new WebpackShellPlugin({
        onBuildEnd: ['nodemon dist/index.js --watch dist'],
      })
    ],
  }
)
