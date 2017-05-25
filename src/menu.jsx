import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

class MenuLink extends Component {
  static propTypes = {
    name: PropTypes.string,
    id: PropTypes.string
  }

  render () {
    return (
      <NavLink to={'/' + this.props.id} activeClassName="active" exact={this.props.id === ''}>
        {this.props.name}
      </NavLink>
    )
  }
}

export class Menu extends Component {
  render () {
    let items = [
      { id: '', name: 'Home' },
      { id: 'works', name: 'List of Works' },
      { id: 'biography', name: 'Biography' },
      { id: 'press', name: 'Press' },
      { id: 'research', name: 'Research' }
    ]
    return (
      <nav>
        <ul>
          {items.map((m) => <li key={m.id}><MenuLink {...m} /></li>)}
          <li>
            <a href='mailto:cjwalter@arcor.de'> Contact </a>
          </li>
        </ul>
      </nav>
    )
  }
}
