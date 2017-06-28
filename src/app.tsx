import * as React from 'react'
import { Route, Switch } from 'react-router-dom'

import { Menu } from './menu'
import { ServiceWorkerController } from './serviceworker'
import { IndexPage } from './pages/index'
import { _404Page } from './pages/404'
import { WorksPage } from './pages/works'
import { BioPage } from './pages/bio'
import { PressPage } from './pages/press'
import { ResearchPage } from './pages/research'

export class App extends React.Component {
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
            © 2015 - {new Date().getFullYear()} Caspar Johannes Walter
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
