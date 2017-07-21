let React = require('react')
let ReactDOMServer = require('react-dom/server')
let StaticRouter = require('react-router-dom').StaticRouter
let Sitemap = require('sitemap')

function requirePatched (asset) {
  let Module = module.constructor
  let m = new Module()
  m._compile(asset.source(), 'module')
  return global['__PREBUILD_REQUIRE__'](global['__PREBUILD_REQUIRE__'].s)
}

module.exports = function (options) {
  function buildRoute (routes, route, compilation, base) {
    console.error('building route', route) // don't disturb stdout
    let context = {}
    const rendered = ReactDOMServer.renderToString(
      React.createElement(
        StaticRouter,
        { location: '/' + route, context },
        routes.node
      )
    )
    let html = options.embed(route, rendered, base)
    compilation.assets[route + '.html'] = {
      source: () => html,
      size: () => html.length
    }
  }

  function apply (compiler) {
    compiler.plugin('compilation', function (compilation) {
      // FIXME: this is incredibly horrible
      compilation.mainTemplate.plugin('startup', function (source, module, hash) {
        if (!module.chunks.length && source.indexOf('__PREBUILD_REQUIRE__') === -1) {
          let originName = module.origins && module.origins.length ? module.origins[0].name : 'main'
          if (originName === options.require) {
            return 'global.__PREBUILD_REQUIRE__ = __webpack_require__' + source
          }
        }
        return source
      })
    })

    compiler.plugin('emit', function (compilation, callback) {
      let required = requirePatched(compilation.assets[options.require + '.js'])
      let routes = options.routes(required)
      let base = options.base(compilation.assets)

      routes.routes.forEach((route) => buildRoute(routes, route, compilation, base))
      if (options.sitemap) {
        let sitemap = Sitemap.createSitemap({
          hostname: 'https://' + options.hostname,
          cacheTime: 600000,
          urls: []
        })
        routes.routes.filter(options.sitemapFilter)
          .forEach((route) => {
            sitemap.add({ url: route })
          })
        let data = sitemap.toString()
        compilation.assets['sitemap.xml'] = {
          source: () => data,
          size: () => data.length
        }
      }
      callback()
    })
  }

  return {
    buildRoute: buildRoute,
    apply: apply
  }
}
