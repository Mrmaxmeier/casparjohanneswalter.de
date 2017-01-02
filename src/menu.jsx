import React from 'react'
import { Link } from 'react-router'

class MenuLink extends React.PureComponent {
  static propTypes = {
    name: React.PropTypes.string,
    id: React.PropTypes.string
  }

  render () {
    return (
      <Link to={'/' + this.props.id} activeClassName='active'>
        {this.props.name}
      </Link>
    )
  }
}

export class Menu extends React.PureComponent {
  render () {
    let items = [
      { id: 'index', name: 'Home' },
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
