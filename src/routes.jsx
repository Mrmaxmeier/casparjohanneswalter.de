import React from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import ReactGA from 'react-ga'

import { App } from './app.jsx'

export class Routes extends React.PureComponent {
  static propTypes = {
    analytics: PropTypes.bool
  }
  render () {
    // TODO: react-ga
    let onUpdate = this.props.analytics ? () => {
      ReactGA.set({ page: window.location.pathname })
      ReactGA.pageview(window.location.pathname)
    } : null
    if (__IN_BUILD__) { // eslint-disable-line no-undef
      return <BrowserRouter><App /></BrowserRouter>
    } else {
      return <HashRouter><App /></HashRouter>
    }
  }
}
