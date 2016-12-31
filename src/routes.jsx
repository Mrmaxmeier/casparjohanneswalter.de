import React from 'react'
import { Router, Route, Link, IndexRedirect } from 'react-router'
import ReactGA from 'react-ga'
import { dependencies } from '../package.json'
import { keys, map } from 'underline'

import { App } from './app.jsx'
import { IndexPage } from './pages/index.jsx'
import { WorksPage } from './pages/works.jsx'
import { BioPage } from './pages/bio.jsx'
import { PressPage } from './pages/press.jsx'
import {
  ResearchPage, Kithara, PartchFraction,
  Converters, SoundGenPage, DiffTonePage,
  FractionWindowingPage, PianoMultiphonicCalculatorIIPage,
  HarmonicBeatingCalculatorPage, TonalityDiamondPage,
  ChordPlayerPage
} from './pages/research.jsx'

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

let routeComponents = {
  '/index': IndexPage,
  '/works': WorksPage,
  '/tags/:tag': WorksPage,
  '/biography': BioPage,
  '/press': PressPage,
  '/research': ResearchPage,
  '/research/kithara': Kithara,
  '/research/partch_fraction': PartchFraction,
  '/research/converters': Converters,
  '/research/soundgen': SoundGenPage,
  '/research/difftone': DiffTonePage,
  '/research/fraction_windowing': FractionWindowingPage,
  '/research/piano_multiphonic_calculator_2': PianoMultiphonicCalculatorIIPage,
  '/research/harmonic_beating_calculator': HarmonicBeatingCalculatorPage,
  '/research/tonality_diamond': TonalityDiamondPage,
  '/research/chord_player': ChordPlayerPage
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
    let routes = routeComponents::map((v, k) => <Route key={k} path={k} component={v} />)
    return (
      <Router history={history} onUpdate={onUpdate}>
        <Route path="/" component={App}>
          <IndexRedirect to='/index' />
          {routes}
        </Route>
        <Route path='*' component={_404Page} onEnter={_404Page.checkRedirect} />
      </Router>
    )
  }
}

export let routes = routeComponents::keys()
  .concat(tags().map((tag) => 'tags/' + slugify(tag)))
