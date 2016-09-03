let webpack = require('webpack')

module.exports = {
  entry: {
    index: './src/index.jsx'
  },
  output: {
    path: 'build',
    filename: '[name].js'
  },
  module: {
    loaders: [{
      test: /\.(js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel'
    }, {
      test: /\.(jpe?g|png|gif|svg)$/i,
      loaders: [
        'file?name=[name].[ext]',
        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false?progressive=true'
      ]
    }, {
      test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      __IN_BUILD__: JSON.stringify(false)
    })
  ]
}
