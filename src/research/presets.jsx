import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

import { keys, extend } from 'underline'
import download from 'downloadjs'

export class Presets extends PureComponent {
  static propTypes = {
    name: PropTypes.string,
    default: PropTypes.object,
    onChange: PropTypes.func,
    current: PropTypes.func,
    presets: PropTypes.object,
    label: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {
      presets: Object.assign({'-- New --': null}, this.props.presets || {}),
      preset: '-- New --',
      localStorageError: false
    }
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.load()
      }, 100)
    }
  }

  load () {
    let data = window.localStorage.getItem(this.props.name) || '{}'
    let presets = Object.assign({
      '-- New --': null
    }, this.props.presets || {})::extend(JSON.parse(data))
    this.setState({ presets })
    return presets
  }

  save () {
    let data = JSON.stringify(this.state.presets)
    try {
      window.localStorage.setItem(this.props.name, data)
    } catch (e) {
      this.setState({ localStorageError: true })
      console.error(e)
    }
  }

  render () {
    return (
      <tr>
        <th>
          {this.props.label || 'Preset'}
        </th>
        {this.state.localStorageError ? (
          <th style={{ color: 'red' }}>
            {"This session doesn't support local storage of presets."}
          </th>
        ) : null}
        <th>
          <select onChange={(e) => {
            let preset = e.target.value
            let data = this.state.presets[preset]
            this.setState({preset}, () => {
              if (data) {
                this.props.onChange(preset, data)
              }
            })
          }} value={this.state.preset}>
            {this.state.presets::keys().map((key) => {
              return <option key={key} value={key}>{key}</option>
            })}
          </select>
        </th>
        <th>
          <button onClick={() => {
            let name = window.prompt('Preset Name', this.state.preset)
            if (name === null) {
              return
            }
            let data = this.props.current()
            let presets = this.load()
            presets[name] = data
            this.setState({ presets, preset: name }, () => {
              this.save()
              if (data) {
                this.props.onChange(name, data)
              }
            })
          }} disabled={this.state.localStorageError}>
            Save preset
          </button>
        </th>
        <th>
          <button onClick={() => {
            let data = this.props.current()
            let string = JSON.stringify(data, null, 2)
            download(string, this.state.preset + '.json', 'application/json')
            console.log(string)
          }} disabled={this.state.preset === '-- New --' || this.state.localStorageError}>
            Export to file
          </button>
        </th>
        <th>
          <button onClick={() => {
            let e = new window.MouseEvent('click')
            this.filepicker.dispatchEvent(e)
          }} disabled={this.state.localStorageError}>
            Import file
          </button>
          <input ref={(e) => { this.filepicker = e }} type="file" style={{display: 'none'}}
            onChange={(event) => {
              let file = event.target.files[0]
              let name = file.name.replace('.json', '')
              let reader = new window.FileReader()
              reader.readAsText(file)
              reader.onload = () => {
                let data = JSON.parse(reader.result)
                let presets = this.load()
                presets[name] = data
                this.save()
                this.setState({ presets, preset: name }, () => {
                  if (data) {
                    this.props.onChange(name, data)
                  }
                })
              }
            }} />
        </th>
        <th>
          <button onClick={() => {
            let presets = this.load()
            delete presets[this.state.preset]
            let current = presets::keys()[0]
            this.setState({presets, preset: current}, () => {
              if (presets[current]) {
                this.props.onChange(current, presets[current])
              }
              this.save()
            })
          }} disabled={this.state.preset === '-- New --' || this.state.localStorageError}>
            Delete
          </button>
        </th>
      </tr>
    )
  }
}
