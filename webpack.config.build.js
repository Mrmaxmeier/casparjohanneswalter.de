const webpack = require('webpack')
const React = require('react')
const PrebuildRoutesPlugin = require('./prebuild-routes-plugin.js')
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')

const config = require('./webpack.config.js')

module.exports = Object.assign(config, {
  mode: 'production',
  entry: {
    index: './src/index.tsx',
    routes: './src/routes.tsx'
  },
  optimization: { minimize: true },
  plugins: [
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
  ],
  devtool: 'cheap-module-source-map'
})
