import React from 'react'
import { Link } from 'react-router'
import classNames from 'classnames'

class MenuLink extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    id: React.PropTypes.string
  }

  render () {
    return (
      <Link to={'/' + this.props.id}><b>{this.props.name}</b></Link>
//      <a className={classNames({selected: this.props.id === 'index'})}>
//        <b>{this.props.name}</b>
//      </a>
    )
    /* <a {% if text == active_page %} class="selected" {% endif %} href="{{link}}">
      <b style="color: {% if text == active_page %}#777{% else %}#aaa{% endif %}">{{text}}</b>
    </a> */
  }
}

export class Menu extends React.Component {
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
            <a href='mailto:cjwalter@arcor.de'><b>Contact</b></a>
          </li>
        </ul>
      </nav>
    )
  }
}
