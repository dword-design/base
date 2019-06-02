const  path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const webpackMerge = require('webpack-merge')
const { paramCase } = require('change-case')
const { mapKeys } = require('lodash')
const moduleExists = require('module-exists')
const findUpSync = require('findup-sync')
const nodeEnv = require('@dword-design/node-env')
const additionalConfig = moduleExists(path.resolve(process.cwd(), 'webpack.config.js'))
  ? require(path.resolve(process.cwd(), 'webpack.config.js'))
  : {}

const host = '0.0.0.0'
const port = '8080'
const sourceMap = nodeEnv == 'development'
const devtool = nodeEnv == 'development'
  ? 'cheap-module-eval-source-map' // cheap-module-eval-source-map is faster for development
  : false
const doChunk = true
const doMinify = nodeEnv == 'production'

const variablesPath = findUpSync('variables.base.js') || undefined

module.exports = webpackMerge(
  {
    mode: nodeEnv,
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
      filename: nodeEnv == 'production' ? '[name].[contenthash].js' : '[name].js',
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
          loader: require.resolve('eslint-loader'),
          exclude: /node_modules/,
          options: {
            configFile: path.resolve(__dirname, 'eslintrc.js'),
          },
        },
        {
          test: /\.svg$/,
          loader: require.resolve('vue-svg-loader'),
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
          loader: require.resolve('vue-loader'),
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                configFile: path.resolve(__dirname, 'babel.config.js'),
              },
            },
            {
              loader: '@dword-design/linaria/loader',
              options: {
                sourceMap,
                babelOptions: {
                  configFile: path.resolve(__dirname, 'babel.config.js'),
                },
              },
            },
          ],
        },
        ...(() => {
          const postCssLoader = {
            loader: require.resolve('postcss-loader'),
            options: {
              plugins: [require('postcss-import'), require('postcss-url'), require('autoprefixer')],
              sourceMap,
            },
          }
          return [
            {
              test: /\.css$/,
              use: [require.resolve('vue-style-loader'), require.resolve('css-loader'), postCssLoader],
            },
            {
              test: /\.scss$/,
              use: [
                require.resolve('vue-style-loader'),
                require.resolve('css-loader'),
                postCssLoader,
                { loader: require.resolve('sass-loader'), options: { sourceMap } },
                ...variablesPath !== undefined
                  ? [{
                    loader: require.resolve('@epegzz/sass-vars-loader'),
                    options: {
                      vars: mapKeys(require(variablesPath), (_, name) => paramCase(name)),
                    },
                  }]
                  : [],
              ],
            },
          ]
        })(),
        {
          test: /\.(png|jpe?g|gif|mp4|webm|ogg|mp3|wav|flac|aac|woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: require.resolve('url-loader'),
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
