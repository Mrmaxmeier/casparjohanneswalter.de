import * as React from 'react'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import * as ReactGA from 'react-ga'
import createHistory from 'history/createBrowserHistory'

import { tags, slugify } from './tags.js'
import { subpages as researchPages } from './pages/research'
import { App } from './app'

interface RoutesProps extends React.Props<any> {
    analytics: boolean
}

export class Routes extends React.PureComponent<RoutesProps, {}> {
  componentDidMount () {
    if (this.props.analytics) {
      ReactGA.set({ page: window.location.pathname })
      ReactGA.pageview(window.location.pathname)
    }
  }

  render () {
    let history = null
    if (this.props.analytics) {
      history = createHistory()
      history.listen((location, action) => {
        ReactGA.set({ page: location.pathname })
        ReactGA.pageview(location.pathname)
      })
    }
    return __IN_BUILD__ // eslint-disable-line no-undef
      ? <BrowserRouter history={history}>
          <App />
        </BrowserRouter>
      : <HashRouter history={history}>
          <App />
        </HashRouter>
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
  .concat(researchPages.map((page) => 'research/' + page.id))
