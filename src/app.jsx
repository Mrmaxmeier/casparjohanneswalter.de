import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import { Menu } from './menu.jsx'
import { ServiceWorkerController } from './serviceworker.jsx'

export class App extends React.PureComponent {
  static propTypes = {
    children: PropTypes.any
  }
  render () {
    return (
      <div>
        <h1>Caspar Johannes Walter</h1>
        <Menu />
        {this.props.children}
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
