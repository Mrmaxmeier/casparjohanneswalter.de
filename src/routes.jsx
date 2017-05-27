import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import ReactGA from 'react-ga'
import createHistory from 'history/createBrowserHistory'

import { tags, slugify } from './tags.js'
import { App } from './app.jsx'

export class Routes extends React.PureComponent {
  static propTypes = {
    analytics: PropTypes.bool
  }

  componentDidMount () {
    if (this.props.analytics) {
      ReactGA.set({ page: window.location.pathname })
      ReactGA.pageview(window.location.pathname)
    }
  }

  render () {
    let history
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
].concat(tags().map((tag) => 'works/' + slugify(tag)))
