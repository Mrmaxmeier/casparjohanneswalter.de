let webpack = require('webpack')
let path = require('path')
let SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.tsx',
    react: ['react', 'react-dom'],
    mathjs: 'mathjs'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
    publicPath: '//casparjohanneswalter.de/'
  },
  module: {
    rules: [{
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      loader: 'awesome-typescript-loader'
    }, {
      enforce: 'pre',
      test: /\.js$/,
      loader: 'source-map-loader'
    }, {
      test: /\.(jpe?g$|png)/i,
      loaders: [
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]'
      ]
    }, {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      __IN_BUILD__: JSON.stringify(false)
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: 'casparjohanneswalter',
      filename: 'service-worker.js',
      maximumFileSizeToCacheInBytes: 1048576
    })
  ],
  devtool: 'source-map'
}
