import React, { PureComponent } from 'react'

export class ServiceWorkerController extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      status: '',
      message: null,
      online: navigator.onLine || true
    }
    setInterval(this.update.bind(this), 5000)
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

  update () {
    this.setState({online: navigator.onLine || true})
  }

  register () {
    if ('serviceWorker' in navigator) {
      // Your service-worker.js *must* be located at the top-level directory relative to your site.
      // It won't be able to control pages unless it's located at the same level or higher than them.
      // *Don't* register service worker file in, e.g., a scripts/ sub-directory!
      // See https://github.com/slightlyoff/ServiceWorker/issues/468
      navigator.serviceWorker.register('service-worker.js').then((reg) => {
        // updatefound is fired if service-worker.js changes.
        reg.onupdatefound = () => {
          // The updatefound event implies that reg.installing is set; see
          // https://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#service-worker-container-updatefound-event
          var installingWorker = reg.installing

          installingWorker.onstatechange = () => {
            this.setState({status: installingWorker.state})
            switch (installingWorker.state) {
              case 'installed':
                if (navigator.serviceWorker.controller) {
                  // At this point, the old content will have been purged and the fresh content will
                  // have been added to the cache.
                  // It's the perfect time to display a "New content is available; please refresh."
                  // message in the page's interface.
                  this.setState({
                    message: 'New or updated content is available.'
                  })
                  this.setState({status: 'update available'})
                } else {
                  // At this point, everything has been precached.
                  // It's the perfect time to display a "Content is cached for offline use." message.
                  this.setState({
                    message: 'Content is cached for offline use' // 'Content is now available offline!'
                  })
                  this.setState({status: 'offline'})
                }
                break

              case 'redundant':
                console.error('The installing service worker became redundant.')
                break
            }
          }
        }
      }).catch((e) => {
        this.setState({status: 'error'})
        console.error('Error during service worker registration:', e)
      })
    }
  }
}
