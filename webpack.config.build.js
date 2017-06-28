let webpack = require('webpack')
let React = require('react')
let PrebuildRoutesPlugin = require('./prebuild-routes-plugin.js')
let SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

let config = require('./webpack.config.js')

module.exports = Object.assign(config, {
  entry: {
    index: './src/index.jsx',
    routes: './src/routes.jsx'
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {warnings: false},
      output: {comments: false},
      sourceMap: true
    }),
    new webpack.DefinePlugin({
      __IN_BUILD__: JSON.stringify(true)
    }),
    new PrebuildRoutesPlugin({
      base: (assets) => {
        return assets['index.html'].source().toString('utf8')
      },
      embed: function (route, data, base) {
        return base.replace('<main id="app" />', '<main id="app">' + data + '</main>')
      },
      routes: function (routes) {
        console.log('routes func', routes)
        return {
          node: React.createElement(routes.AppComponent, {}),
          routes: routes.routes
        }
      },
      hostname: 'casparjohanneswalter.de',
      require: 'routes',
      sitemap: true,
      sitemapFilter: (route) => !(route.includes('works/') || route === '404')
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: 'casparjohanneswalter',
      filename: 'service-worker.js',
      maximumFileSizeToCacheInBytes: 1048576
    })
  ]
})
