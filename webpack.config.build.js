let webpack = require('webpack')
let PrebuildRoutesPlugin = require('./prebuild-routes-plugin.js')

module.exports = {
  entry: {
    index: './src/index.jsx',
    routes: './src/routes.jsx'
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
        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
      ]
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      __IN_BUILD__: JSON.stringify(false)
    }),
    new PrebuildRoutesPlugin({
      embed: function (route, data, assets) {
        let index = assets['index.html'].source().toString('utf8')
        return index.replace('<main id="app" />', '<main id="app">' + data + '</main>')
      },
      routes: function (routes) {
        return {
          node: (new routes.Routes()).render(),
          routes: routes.routes
        }
      },
      require: 'routes'
    })
  ]
}
