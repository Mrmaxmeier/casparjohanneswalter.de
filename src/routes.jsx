import React from 'react'
import { Router, Route, IndexRedirect, browserHistory } from 'react-router'
import { dependencies } from '../package.json'

import { App } from './app.jsx'
import { IndexPage } from './pages/index.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'
import { ResearchPage, Kithara, PartchFraction } from './pages/research.jsx'

class _404Page extends React.Component {
  static propTypes = {
    location: React.PropTypes.object
  }
  render () {
    return (
      <div>
        <h1>404 Not Found</h1>
        Invalid route: <b>{this.props.location.pathname}</b>
        <center>React: {dependencies['react']} - Router: {dependencies['react-router']}</center>
      </div>
    )
  }
}

export class Routes extends React.Component {
  render () {
    return (
      <Router history={browserHistory}>
        <Route path="/" component={App}>
          <IndexRedirect to='/index' />
          <Route path="/index" component={IndexPage} />
          <Route path="/works" component={WorksPage} />
          <Route path="/tags/:tag" component={WorksPage} />
          <Route path="/biography" component={BioPage} />
          <Route path="/press" component={PressPage} />
          <Route path="/research" component={ResearchPage} />
          <Route path="/research/kithara" component={Kithara} />
          <Route path="/research/partch_fraction" component={PartchFraction} />
        </Route>
        <Route path='*' component={_404Page} />
      </Router>
    )
  }
}

export let routes = [
  'index',
  'works',
  'biography',
  'press',
  'research',
  'research/kithara',
  'research/partch_fraction',
  '404'
]
