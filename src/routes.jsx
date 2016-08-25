import React from 'react'
import { Router, Route, hashHistory, browserHistory } from 'react-router'

import { App } from './app.jsx'
import { IndexPage } from './pages/index.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'
import { ResearchPage, Kithara, PartchFraction } from './pages/research.jsx'

export class Routes extends React.Component {
  renderRelease (release) {
    return (
      <Router history={release ? browserHistory : hashHistory}>
        <Route path="/" component={App}>
          <Route path="/index" component={IndexPage} />
          <Route path="/works" component={WorksPage} />
          <Route path="/tags/:tag" component={WorksPage} />
          <Route path="/biography" component={BioPage} />
          <Route path="/press" component={PressPage} />
          <Route path="/research" component={ResearchPage} />
          <Route path="/research/kithara" component={Kithara} />
          <Route path="/research/partch_fraction" component={PartchFraction} />
        </Route>
      </Router>
    )
  }

  render () {
    return this.renderRelease(false) // TODO: fixme
  }
}
