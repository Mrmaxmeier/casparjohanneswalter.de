import React, { PureComponent } from 'react'

export class ServiceWorkerController extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      status: '',
      message: null
    }
  }

  componentDidMount () {
    this.register()
  }

  render () {
    return (
      <div>
        <b>
          {this.state.message}
        </b>
      </div>
    )
  }

  register () {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').then((reg) => {
        reg.onupdatefound = () => {
          var installingWorker = reg.installing

          installingWorker.onstatechange = () => {
            this.setState({status: installingWorker.state})
            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  this.setState({
                    message: 'New or updated content is available.',
                    status: 'update avaliable'
                  })
                } else {
                  this.setState({
                    message: 'Content is cached for offline use',
                    status: 'offline'
                  })
                }
                break

              case 'redundant':
                console.error('The installing service worker became redundant.')
                break
            }
          }
        }
      }).catch((e) => {
        this.setState({
          status: 'error',
          message: 'Error during service worker registration.'
        })
        console.error('Error during service worker registration:', e)
      })
    }
  }
}
