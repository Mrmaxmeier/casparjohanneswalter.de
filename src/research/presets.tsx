import * as React from 'react'

import { extend } from 'lodash'
import * as download from 'downloadjs'

interface Props<T> {
    name: string,
    default: T,
    onChange: (key: string, data: T) => void,
    current: () => T,
    presets: { [preset: string]: T }
}

interface State<T> {
  presets: { [preset: string]: T | null }
  preset: string,
  localStorageError: boolean
}

export class Presets<T> extends React.PureComponent<Props<T>, State<T>> {
  private filepicker: HTMLInputElement;

  constructor (props: Props<T>) {
    super(props)
    this.state = {
      presets: {'-- New --': null, ...this.props.presets},
      preset: '-- New --',
      localStorageError: false
    }
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.load()
      }, 100)
    }
  }

  load (): { [key: string]: T | null } {
    let data = window.localStorage.getItem(this.props.name) || '{}'
    let presets = {'-- New --': null, ...this.props.presets}
    let parsed = JSON.parse(data)
    presets = extend(presets, parsed)
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
            {Object.keys(this.state.presets).map((key) => {
              return <option key={key} value={key}>{key}</option>
            })}
          </select>
        </th>
        <th>
          <button onClick={() => {
            const name = window.prompt('Preset Name', this.state.preset)
            if (name === null) { return }
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
            let e = new MouseEvent('click')
            this.filepicker.dispatchEvent(e)
          }} disabled={this.state.localStorageError}>
            Import file
          </button>
          <input ref={(e) => { if (e) this.filepicker = e }} type="file" style={{display: 'none'}}
            onChange={(event) => {
              let file = (event.target.files || [])[0]
              let name = file.name.replace('.json', '')
              let reader = new FileReader()
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
            let current = Object.keys(presets)[0]
            this.setState({ presets, preset: current }, () => {
              let pc = presets[current]
              if (pc) {
                this.props.onChange(current, pc)
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
