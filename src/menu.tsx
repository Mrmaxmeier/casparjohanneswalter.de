import { Component } from 'react'
import * as React from "react"
import { NavLink } from 'react-router-dom'

interface MenuLinkProps extends React.Props<any> {
    name: string,
    id: string
}

class MenuLink extends React.Component<MenuLinkProps, {}> {
  render () {
    return (
      <NavLink to={'/' + this.props.id} activeClassName="active" exact={this.props.id === ''}>
        {this.props.name}
      </NavLink>
    )
  }
}

export class Menu extends React.Component {
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
