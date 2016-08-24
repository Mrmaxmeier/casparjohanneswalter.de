import React from 'react'
import moment from 'moment'

import { Menu } from './menu.jsx'

export class App extends React.Component {
  render () {
    return (
      <div>
        <h1>Caspar Johannes Walter</h1>
        <Menu />
        <img src={require('../static/index.jpg')} />
        <footer>
          <p>© Caspar Johannes Walter {moment().format('YYYY')}</p>
        </footer>
      </div>
    )
  }
}
