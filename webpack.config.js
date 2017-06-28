let webpack = require('webpack')
let path = require('path')
let SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

module.exports = {
  entry: {
    index: './src/index.jsx', // TODO: tsx
    react: ['react', 'react-dom'],
    mathjs: 'mathjs'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
    publicPath: '//casparjohanneswalter.de/'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      loader: 'awesome-typescript-loader'
    }, {
      test: /\.(jpe?g$|png)/i,
      loaders: [
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false?progressive=true'
      ]
    }, {
      test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file-loader'
    }, {
      test: /\.json$/,
      loader: 'json-loader'
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
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /de|en/)
  ],
  devtool: 'source-map'
}
