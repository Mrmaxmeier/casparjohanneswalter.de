let React = require('react')
let ReactDOMServer = require('react-dom/server')
let StaticRouter = require('react-router-dom').StaticRouter
let Sitemap = require('sitemap')

function requirePatched(asset) {
  let Module = module.constructor
  let m = new Module()
  m._compile(asset.source(), 'module')
  return global['__PREBUILD_REQUIRE__'](global['__PREBUILD_REQUIRE__'].s)
}

class PrebuildRoutesPlugin {
  constructor(options) {
    this.options = options
    this.buildRoute = this.buildRoute.bind(this)
    this.apply = this.apply.bind(this)
  }
  buildRoute(routes, route, compilation, base) {
    if (route[0] !== '/') {
      route = '/' + route
    }
    console.error('building route', route) // don't disturb stdout
    let context = {}
    const rendered = ReactDOMServer.renderToString(
      React.createElement(
        StaticRouter,
        { location: route, context },
        routes.node
      )
    )
    let html = this.options.embed(route, rendered, base)
    compilation.assets[route + '.html'] = {
      source: () => html,
      size: () => html.length
    }
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap("prebuild-routes comp", (compilation) => {
      // FIXME: this is incredibly horrible
      compilation.mainTemplate.hooks.startup.tap("prebuild-routes startup", (source, module, hash) => {
        if (source.indexOf('__PREBUILD_REQUIRE__') === -1) {
          if (module.name === this.options.require) {
            return 'global.__PREBUILD_REQUIRE__ = __webpack_require__' + source
          }
        }
        return source
      })
    })

    compiler.hooks.emit.tap("prebuild-routes emit", (compilation) => {
      let required = requirePatched(compilation.assets[this.options.require + '.js'])
      let routes = this.options.routes(required)
      let base = this.options.base(compilation.assets)

      routes.routes.forEach((route) => this.buildRoute(routes, route, compilation, base))
      if (this.options.sitemap) {
        let sitemap = Sitemap.createSitemap({
          hostname: 'https://' + this.options.hostname,
          cacheTime: 60000,
          urls: []
        })
        routes.routes.filter(this.options.sitemapFilter)
          .forEach((route) => {
            sitemap.add({ url: route })
          })
        let data = sitemap.toString()
        compilation.assets['sitemap.xml'] = {
          source: () => data,
          size: () => data.length
        }
      }
    })
  }
}

module.exports = PrebuildRoutesPlugin
