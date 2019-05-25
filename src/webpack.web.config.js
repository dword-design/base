const  path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackMerge = require('webpack-merge')
const { paramCase } = require('change-case')
const { mapKeys } = require('@dword-design/functions')
const moduleExists = require('module-exists')
const additionalConfig = moduleExists(path.resolve(process.cwd(), 'webpack.config.js'))
  ? require(path.resolve(process.cwd(), 'webpack.config.js'))
  : {}

const host = '0.0.0.0'
const port = '8080'
const sourceMap = (process.env.NODE_ENV || 'development') == 'development'
const devtool = (process.env.NODE_ENV || 'development') == 'development'
  ? 'cheap-module-eval-source-map' // cheap-module-eval-source-map is faster for development
  : false
const doChunk = true
const doMinify = process.env.NODE_ENV == 'production'
const bundleAnalyzerReport = false

module.exports = webpackMerge(
  {
    mode: process.env.NODE_ENV ?? 'development',
    context: process.cwd(),
    resolve: {
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
    },
    devServer: {
      hot: true,
      contentBase: false, // since we use CopyWebpackPlugin.
      compress: true,
      progress: true,
      host,
      port,
      overlay: { warnings: false, errors: true },
      clientLogLevel: 'warning',
    },
    output: {
      path: path.resolve(process.cwd(), 'dist'),
      filename: process.env.NODE_ENV == 'production' ? '[name].[contenthash].js' : '[name].js',
    },
    devtool,
    ...doChunk
      ? {
        optimization: {
          runtimeChunk: 'single',
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            //minSize: 0,
            cacheGroups: {
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: module => {
                  // get the name. E.g. node_modules/packageName/not/this/part.js
                  // or node_modules/packageName
                  const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]

                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `npm.${packageName.replace('@', '')}`
                },
              },
            },
          },
        },
      }
      : {},
    plugins: [
      // new StyleLintPlugin({
      //   files: ['**/*.{vue,htm,html,css,sss,less,scss,sass}'],
      // })
      ...bundleAnalyzerReport
        ? [(() => {
          const WebpackBundleAnalyzer = require('webpack-bundle-analyzer')
          return new WebpackBundleAnalyzer.BundleAnalyzerPlugin
        })()]
        : [],
      new CleanWebpackPlugin(),
      new VueLoaderPlugin(),
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'index.html',
        inject: true,
        ...doMinify
          ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeAttributeQuotes: true,
            },
          }
          : {},
      }),
      // keep module.id stable when vendor modules does not change
      new webpack.HashedModuleIdsPlugin(),
    ],
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.svg$/,
          loader: 'vue-svg-loader',
          options: {
            svgo: {
              plugins: [
                { removeViewBox: false },
              ],
            },
          },
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            { loader: 'babel-loader' },
            {
              loader: '@dword-design/linaria/loader',
              options: { sourceMap },
            },
          ],
        },
        ...(() => {
          const postCssLoader = {
            loader: 'postcss-loader',
            options: {
              plugins: [require('postcss-import'), require('postcss-url'), require('autoprefixer')],
              sourceMap,
            },
          }
          return [
            {
              test: /\.css$/,
              use: ['vue-style-loader', 'css-loader', postCssLoader],
            },
            {
              test: /\.scss$/,
              use: [
                'vue-style-loader',
                'css-loader',
                postCssLoader,
                { loader: 'sass-loader', options: { sourceMap } },
              ],
            },
          ]
        })(),
        {
          test: /\.(png|jpe?g|gif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'assets/[name].[hash:7].[ext]',
          },
        },
      ],
    },
  },
  additionalConfig,
)
