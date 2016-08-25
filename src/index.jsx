require('file-loader!file?name=[name].[ext]!./index.html')
require('style!css!../node_modules/marx-css/css/marx.css')
require('style!css!./dropdown.css') // TODO: scss magic
require('!style!css!sass!./style.scss')

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

import { App, IndexPage, Test2 } from './app.jsx'
import { BioPage } from './bio.jsx'


export class RoutedApp extends React.Component {
  render () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={App}>
          <Route path="/index" component={IndexPage} />
          <Route path="/biography" component={BioPage} />
        </Route>
      </Router>
    )
  }
}


ReactDOM.render(
  <RoutedApp />,
  document.getElementById('app')
)
