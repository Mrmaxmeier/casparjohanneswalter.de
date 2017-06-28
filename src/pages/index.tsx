import * as React from 'react'
import { RouteComponentProps } from 'react-router-dom'

export class IndexPage extends React.PureComponent<RouteComponentProps<any>, {}> {
  render () {
    return (
      <img id="index" src={require<string>('../../assets/index.jpg')} />
    )
  }
}
