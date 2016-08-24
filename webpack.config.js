module.exports = {
  entry: ['./src/index.jsx'],
  output: {
    path: 'build',
    filename: 'index.bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js(x)$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }, {
      test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file-loader'
    }]
  }
}
