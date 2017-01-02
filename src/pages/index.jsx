import React from 'react'

export class IndexPage extends React.PureComponent {
  render () {
    return (
      <img id="index" src={require('../../static/index.jpg')} />
    )
  }
}
