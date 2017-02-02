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
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
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
        let routesElem = React.createElement(routes.Routes, {})
        let renderRoutes = (new routes.Routes()).render
        return {
          node: renderRoutes.bind(routesElem)(),
          routes: routes.routes
        }
      },
      hostname: 'casparjohanneswalter.de',
      require: 'routes',
      sitemap: true,
      sitemapFilter: (route) => !(route.includes('tags/') || route === '404')
    }),
    new SWPrecacheWebpackPlugin({
      cacheId: 'casparjohanneswalter',
      filename: 'service-worker.js',
      maximumFileSizeToCacheInBytes: 4194304
    })
  ],
  devtool: undefined
})
