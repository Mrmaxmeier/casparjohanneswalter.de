let shared = {
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
      test: /\.(ttf|eot|svg|jpg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
      loader: 'file'
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  }
}

module.exports = [
  Object.assign({entry: {index: './src/index.jsx'}}, shared),
  Object.assign({
    entry: {build: './build.jsx'},
    target: 'node'
  }, shared)
]
