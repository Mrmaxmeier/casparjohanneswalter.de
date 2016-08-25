require('file-loader!file?name=[name].[ext]!./index.html')
require('style!css!../node_modules/marx-css/css/marx.css')
require('!style!css!sass!./style.scss')

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

import { App } from './app.jsx'
import { IndexPage } from './pages/index.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'

export class RoutedApp extends React.Component {
  render () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <Route path="/index" component={IndexPage} />
          <Route path="/works" component={WorksPage} />
          <Route path="/tags/:tag" component={WorksPage} />
          <Route path="/biography" component={BioPage} />
          <Route path="/press" component={PressPage} />
        </Route>
      </Router>
    )
  }
}

ReactDOM.render(
  <RoutedApp />,
  document.getElementById('app')
)
