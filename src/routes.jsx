import React from 'react'
import { Router, Route, Link, IndexRedirect } from 'react-router'
import ReactGA from 'react-ga'
import { dependencies } from '../package.json'

import { App } from './app.jsx'
import { IndexPage } from './pages/index.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'
import { ResearchPage, Kithara, PartchFraction, Converters, SoundGenPage, DiffTonePage, FractionWindowingPage } from './pages/research.jsx'

import { tags, slugify } from './tags.js'

let rr = require('react-router')
let history = __IN_BUILD__ ? rr.browserHistory : rr.hashHistory // eslint-disable-line no-undef

class _404Page extends React.Component {
  static propTypes = {
    location: React.PropTypes.object
  }
  static checkRedirect (nextState, replace) {
    let path = nextState.location.pathname
    if (path.endsWith('.html')) {
      console.log('redirecting', nextState.location.pathname, 'to', path.slice(0, -5))
      replace({
        pathname: path.slice(0, -5)
      })
    }
  }
  render () {
    return (
      <div>
        <h1>404 Not Found</h1>
        Invalid route: <b>{this.props.location.pathname}</b><br />
        Return to <Link to={'/index'}>index</Link>
        <center>React: {dependencies['react']} - Router: {dependencies['react-router']}</center>
      </div>
    )
  }
}

export class Routes extends React.Component {
  static propTypes = {
    analytics: React.PropTypes.bool
  }
  render () {
    let onUpdate = this.props.analytics ? () => {
      ReactGA.set({ page: window.location.pathname })
      ReactGA.pageview(window.location.pathname)
    } : null
    return (
      <Router history={history} onUpdate={onUpdate}>
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
          <Route path="/research/converters" component={Converters} />
          <Route path="/research/soundgen" component={SoundGenPage} />
          <Route path="/research/difftone" component={DiffTonePage} />
          <Route path="/research/fraction_windowing" component={FractionWindowingPage} />
        </Route>
        <Route path='*' component={_404Page} onEnter={_404Page.checkRedirect} />
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
  'research/converters',
  'research/soundgen',
  'research/difftone',
  '404'
].concat(tags().map((tag) => 'tags/' + slugify(tag)))
