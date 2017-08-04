import * as React from 'react'

import { extend } from 'lodash'
import * as download from 'downloadjs'

interface Props<T> {
    name: string,
    default?: T,
    defaultKey?: string,
    onChange: (key: string, data: T) => void,
    current: () => T,
    presets?: { [preset: string]: T },
    label?: string,
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
    let defaultPresets: { [key: string]: T | null } = { '-- New --': this.props.default || null }
    this.state = {
      presets: {...defaultPresets, ...this.props.presets} as { [preset: string]: T | null },
      preset: this.props.defaultKey || '-- New --',
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
    let presets = {
      '-- New --': null,
      ...this.props.presets,
      ...JSON.parse(data)
    }
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


interface QuickSavesProps<Save> {
  saveData: (i: number) => Save,
  load: (save: Save) => void,
}
interface QuickSaveState<Save> {
  saves: (Save | null)[]
}
export class QuickSaves<Save> extends React.PureComponent<QuickSavesProps<Save>, QuickSaveState<Save>> {
  constructor (props: QuickSavesProps<Save>) {
    super(props)
    this.state = {
      saves: new Array(8).fill(null)
    }
  }
  render () {
    return (
        <table>
          <tbody>
            <tr>
              {this.state.saves.map((_: Save, i: number) => (
                <th key={i} style={{padding: '8px'}}>
                  <button
                    onClick={() => {
                      let save = this.props.saveData(i)
                      let saves = [...this.state.saves];
                      saves[i] = save
                      if (i == saves.length - 1) {
                        saves.push(null);
                      }
                      this.setState({ saves })
                    }}
                    style={{padding: '8px'}}
                  >Save {i + 1}</button>
                </th>
              ))}
            </tr>
            <tr>
              {this.state.saves.map((data: Save, i: number) => (
                <th key={i} style={{padding: '8px'}}>
                  <button
                    disabled={!data}
                    onClick={() => this.props.load(data)}
                    style={{padding: '8px'}}
                  >Load {i + 1}</button>
                </th>
              ))}
            </tr>
          </tbody>
        </table>
    )
  }
}
