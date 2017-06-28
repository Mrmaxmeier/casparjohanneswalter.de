import * as React from 'react'

export class IndexPage extends React.PureComponent {
  render () {
    return (
      <img id="index" src={require('../../assets/index.jpg')} />
    )
  }
}
