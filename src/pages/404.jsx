import React from 'react'
import PropTypes from 'prop-types'
import { dependencies } from '../../package.json'
import { Link, Redirect } from 'react-router-dom'

export class _404Page extends React.PureComponent {
  static propTypes = {
    location: PropTypes.object
  }

  redirect (path) {
    if (path === '/index') { return '/' }
    if (path.endsWith('.html')) {
      return path.slice(0, -5)
    }
    if (path.startsWith('/tags/')) {
      return path.replace('/tags/', '/works/')
    }
  }

  render () {
    let path = this.props.location.pathname
    return (
      <div>
        <h1>404 Not Found</h1>
        Invalid route: <b>{path}</b><br />
        Return to <Link to='/'>Home</Link>
        <center>React: {dependencies['react']} - Router: {dependencies['react-router-dom']}</center>
        {this.redirect(path) ? <Redirect to={this.redirect(path)} /> : null}
      </div>
    )
  }
}
