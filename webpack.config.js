let webpack = require('webpack')
let path = require('path')

module.exports = {
  entry: {
    index: './src/index.jsx',
    react: ['react', 'react-dom'],
    mathjs: 'mathjs'
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.jpe?g$/i,
      loaders: [
        'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
        'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false?progressive=true'
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
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /de|en/)
  ]
}
