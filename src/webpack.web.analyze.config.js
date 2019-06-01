const webConfig = require('./webpack.web.config')
const webpackMerge = require('webpack-merge')
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer')

module.exports = webpackMerge(
  webConfig,
  {
    plugins: [
      new WebpackBundleAnalyzer.BundleAnalyzerPlugin
    ],
  }
)
