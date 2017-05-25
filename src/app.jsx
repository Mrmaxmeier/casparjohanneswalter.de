import React, { Component } from 'react'
import moment from 'moment'
import { Route, Switch } from 'react-router-dom'

import { Menu } from './menu.jsx'
import { ServiceWorkerController } from './serviceworker.jsx'
import { IndexPage } from './pages/index.jsx'
import { _404Page } from './pages/404.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'
import { ResearchPage } from './pages/research.jsx'

export class App extends Component {
  render () {
    return (
      <div>
        <h1>Caspar Johannes Walter</h1>
        <Menu />
        <Switch>
          <Route exact path="/" component={IndexPage} />
          <Route path="/index" component={IndexPage} />
          <Route path="/biography" component={BioPage} />
          <Route exact path="/works" component={WorksPage} />
          <Route path="/works/:tag" component={WorksPage} />
          <Route path="/press" component={PressPage} />
          <Route path="/research" component={ResearchPage} />
          <Route component={_404Page} />
        </Switch>
        <footer>
          <p>
            © 2015 - {moment().format('YYYY')} Caspar Johannes Walter
            <br />
            All Rights Reserved
            <br />
          </p>
          <ServiceWorkerController />
        </footer>
      </div>
    )
  }
}
