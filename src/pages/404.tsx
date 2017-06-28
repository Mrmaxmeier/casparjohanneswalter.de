import * as React from 'react'
import { Link, Redirect, RouteComponentProps } from 'react-router-dom'

const _package = require<{
  dependencies: {
    react: string,
    ["react-router-dom"]: string
  }
}>('../../package.json')
const dependencies = _package.dependencies

export class _404Page extends React.PureComponent<RouteComponentProps<any>, {}> {
  redirect (path: string): string | undefined {
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
    let redirect = this.redirect(path)
    return (
      <div>
        <h1>404 Not Found</h1>
        Invalid route: <b>{path}</b><br />
        Return to <Link to='/'>Home</Link>
        <div style={{ textAlign: 'center' }}>
          React: {dependencies['react']} - Router: {dependencies['react-router-dom']}
        </div>
        {redirect ? <Redirect to={redirect} /> : null}
      </div>
    )
  }
}
