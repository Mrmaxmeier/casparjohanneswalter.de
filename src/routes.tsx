import * as React from 'react'
import { BrowserRouter, HashRouter, Router } from 'react-router-dom'
import { createBrowserHistory, createHashHistory } from 'history'

import { tags, slugify } from './tags'
import { subpages as researchPages, PageDef } from './pages/research'
import { App } from './app'

declare var __IN_BUILD__: boolean

interface RoutesProps extends React.Props<any> {
    analytics: boolean
}

export class Routes extends React.PureComponent<RoutesProps, {}> {
  render () {
    let history = (__IN_BUILD__
      ? () => createBrowserHistory()
      : () => createHashHistory()
    )()

    return <Router history={history}><App /></Router>
  }
}

export let AppComponent = App
export let routes = [
  '/index',
  '/works',
  '/biography',
  '/press',
  '/research'
]
  .concat(tags().map((tag) => 'works/' + slugify(tag)))
  .concat(researchPages.map((page: PageDef) => 'research/' + page.id))
