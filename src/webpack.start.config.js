const webpackMerge = require('webpack-merge')
const baseConfig = require('./webpack.config')
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
