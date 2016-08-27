import React from 'react'
import moment from 'moment'

import { Menu } from './menu.jsx'

export class App extends React.Component {
  static propTypes = {
    children: React.PropTypes.any
  }
  render () {
    return (
      <div>
        <h1>Caspar Johannes Walter</h1>
        <Menu />
        {this.props.children}
        <footer>
          <p>© 2015 - {moment().format('YYYY')} Caspar Johannes Walter <br /> All Rights Reserved</p>
        </footer>
      </div>
    )
  }
}
