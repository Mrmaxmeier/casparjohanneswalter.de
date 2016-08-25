let fs = require('fs')
import React from 'react'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import { Routes } from './src/routes.jsx'
import { tags, slugify } from './src/tags.js'

let index = fs.readFileSync('src/index.html').toString()

let routesToRender = [
  'index',
  'works',
  'biography',
  'press',
  'research',
  'research/kithara',
  'research/partch_fraction'
]

tags().forEach((tag) => routesToRender.push('tags/' + slugify(tag)))

let routes = new Routes().render()

routesToRender.forEach((route) => {
  // Note that req.url here should be the full URL path from
  // the original request, including the query string.
  match({ routes, location: route }, (error, redirectLocation, renderProps) => {
    if (error) {
      console.log(error.message)
      throw error
    } else if (redirectLocation) {
      // res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      console.log(302, redirectLocation.pathname + redirectLocation.search)
      let err = '302'
      throw err
    } else if (renderProps) {
      // You can also check renderProps.components or renderProps.routes for
      // your "not found" component or route respectively, and send a 404 as
      // below, if you're using a catch-all route.
      let rendered = renderToString(<RouterContext {...renderProps} />)
      let html = index.replace('<main id="app" />', '<main id="app">' + rendered + '</main>')
      console.log('saving', route)

      let dir = './build/' + route.split('/').slice(0, -1).join('/')
      if (dir.length > 0 && !fs.existsSync(dir)) {
        console.log('making dir \'' + dir + '\'')
        fs.mkdirSync(dir)
      }
      let err = fs.writeFileSync('./build/' + route + '.html', html)
      if (err) {
        throw err
      }
      console.log('saved', route)
    } else {
      console.log(404, route)
      let err = 'not found'
      throw err
    }
  })
})
