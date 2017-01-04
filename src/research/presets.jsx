import React, {PureComponent} from 'react'

import { keys, extend } from 'underline'
import download from 'downloadjs'

export class Presets extends PureComponent {
  static propTypes = {
    name: React.PropTypes.string,
    default: React.PropTypes.object,
    onChange: React.PropTypes.func,
    current: React.PropTypes.func
  }
  constructor (props) {
    super(props)
    this.state = {
      presets: {'-- New --': null},
      preset: '-- New --'
    }
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.load()
      }, 100)
    }
  }

  load () {
    let data = window.localStorage.getItem(this.props.name) || '{}'
    let presets = {
      '-- New --': this.props.default
    }::extend(JSON.parse(data))
    this.setState({ presets })
    return presets
  }

  save () {
    let data = JSON.stringify(this.state.presets)
    window.localStorage.setItem(this.props.name, data)
  }

  render () {
    return (
      <tr>
        <th>
          Preset
        </th>
        <th>
          <select onChange={(e) => {
            let preset = e.target.value
            let data = this.state.presets[preset]
            this.setState({preset}, () => this.props.onChange(preset, data))
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
              this.props.onChange(name, data)
            })
          }}>
            Save preset
          </button>
        </th>
        <th>
          <button onClick={() => {
            let data = this.dumpPreset()
            let string = JSON.stringify(data, null, 2)
            download(string, this.state.preset + '.json', 'application/json')
            console.log(string)
          }} disabled={this.state.preset === '-- New --'}>
            Export to file
          </button>
        </th>
        <th>
          <button onClick={() => {
            let e = new window.MouseEvent('click')
            this.refs.filepicker.dispatchEvent(e)
          }}>
            Import file
          </button>
          <input ref="filepicker" type="file" style={{display: 'none'}}
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
                  this.props.onChange(name, data)
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
              this.props.onChange(current, presets[current])
              this.save()
            })
          }} disabled={this.state.preset === '-- New --'}>
            Delete
          </button>
        </th>
      </tr>
    )
  }
}
