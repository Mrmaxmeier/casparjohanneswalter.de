import * as React from 'react'
import { range, mapValues, clone } from 'lodash'

import { MathInput, PrecNumber } from './components'
import { FrequencyNode, AudioController, AudioControllerRow } from './audioComponents'
import { normalizeOctave, ratioToCents } from './converters.js'
import { Presets } from './presets.jsx'

const labels = [
  ['A♭', 'C', 'E', 'G♯', 'B♯', 'D♯♯', 'F♯♯♯', 'A♯♯♯', 'C♯♯♯♯'],
  ['D♭', 'F', 'A', 'C♯', 'E♯', 'G♯♯', 'B♯♯', 'D♯♯♯', 'F♯♯♯♯'],
  ['G♭', 'B♭', 'D', 'F♯', 'A♯', 'C♯♯', 'E♯♯', 'G♯♯♯', 'B♯♯♯'],
  ['C♭', 'E♭', 'G', 'B♮', 'D♯', 'F♯♯', 'A♯♯', 'C♯♯♯', 'E♯♯♯'],
  ['F♭', 'A♭', 'C', 'E', 'G♯', 'B♯', 'D♯♯', 'F♯♯♯', 'A♯♯♯'],
  ['B♭♭', 'D♭', 'F', 'A', 'C♯', 'E♯', 'G♯♯', 'B♯♯', 'D♯♯♯'],
  ['E♭♭', 'G♭', 'B♭', 'D', 'F♯', 'A♯', 'C♯♯', 'E♯♯', 'G♯♯♯'],
  ['A♭♭', 'C♭', 'E♭', 'G', 'B♮', 'D♯', 'F♯♯', 'A♯♯', 'C♯♯♯'],
  ['D♭♭', 'F♭', 'A♭', 'C', 'E', 'G♯', 'B♯', 'D♯♯', 'F♯♯♯'],
  ['G♭♭', 'B♭♭', 'D♭', 'F', 'A', 'C♯', 'E♯', 'G♯♯', 'B♯♯'],
  ['C♭♭', 'E♭♭', 'G♭', 'B♭', 'D', 'F♯', 'A♯', 'C♯♯', 'E♯♯'],
  ['F♭♭', 'A♭♭', 'C♭', 'E♭', 'G', 'B♮', 'D♯', 'F♯♯', 'A♯♯'],
  ['B♭♭♭', 'D♭♭', 'F♭', 'A♭', 'C', 'E', 'G♯', 'B♯', 'D♯♯'],
  ['E♭♭♭', 'G♭♭', 'B♭♭', 'D♭', 'F', 'A', 'C♯', 'E♯', 'G♯♯'],
  ['A♭♭♭', 'C♭♭', 'E♭♭', 'G♭', 'B♭', 'D', 'F♯', 'A♯', 'C♯♯'],
  ['D♭♭♭', 'F♭♭', 'A♭♭', 'C♭', 'E♭', 'G', 'B♮', 'D♯', 'F♯♯'],
  ['G♭♭♭', 'B♭♭♭', 'D♭♭', 'F♭', 'A♭', 'C', 'E', 'G♯', 'B♯'],
  ['C♭♭♭', 'E♭♭♭', 'G♭♭', 'B♭♭', 'D♭', 'F', 'A', 'C♯', 'E♯'],
  ['F♭♭♭', 'A♭♭♭', 'C♭♭', 'E♭♭', 'G♭', 'B♭', 'D', 'F♯', 'A♯'],
  ['B♭♭♭♭', 'D♭♭♭', 'F♭♭', 'A♭♭', 'C♭', 'E♭', 'G', 'B♮', 'D♯'],
  ['E♭♭♭♭', 'G♭♭♭', 'B♭♭♭', 'D♭♭', 'F♭', 'A♭', 'C', 'E', 'G♯'],
  ['A♭♭♭♭', 'C♭♭♭', 'E♭♭♭', 'G♭♭', 'B♭♭', 'D♭', 'F', 'A', 'C♯'],
  ['D♭♭♭♭', 'F♭♭♭', 'A♭♭♭', 'C♭♭', 'E♭♭', 'G♭', 'B♭', 'D', 'F♯'],
  ['G♭♭♭♭', 'B♭♭♭♭', 'D♭♭♭', 'F♭♭', 'A♭♭', 'C♭', 'E♭', 'G', 'B♮'],
  ['C♭♭♭♭', 'E♭♭♭♭', 'G♭♭♭', 'B♭♭♭', 'D♭♭', 'F♭', 'A♭', 'C', 'E']
]

const WIDTH = 9
const HEIGHT = 25

interface RowProps {
  preset: 'ji' | 'schismatic' | 'schismatic_optimized7' | 'edo53',
  y: number,
  centralC: number
}

interface RowState {
  octave: number[],
  playing: boolean[]
}

class Row extends React.PureComponent<RowProps, RowState> {
  constructor (props: RowProps) {
    super(props)
    this.state = {
      octave: new Array(WIDTH).fill(0),
      playing: new Array(WIDTH).fill(false)
    }
  }

  data (x: number, y: number) {
    return {
      ji: 3 ** y * 5 ** x,
      schismatic: 3 ** (y - x * 8),
      schismatic_optimized7: ((2 ** 9 * (4 / 7)) ** (1 / 14)) ** (y - x * 8),
      edo53: 2 ** ((31 * y + 17 * x) % 53 / 53)
    }[this.props.preset]
  }

  render () {
    let { y, centralC } = this.props
    return (
      <tr key={y}>
        <th>{y}</th>
        {range(-4, 5).map(x => {
          const index = (x + 4)
          let value = this.data(x, y)
          let freqRatio = normalizeOctave(value)
          let cents = ratioToCents(freqRatio)
          let freq = freqRatio * centralC * Math.pow(2, this.state.octave[index])
          return (
            <td key={x} style={{padding: '4px'}}>
              <FrequencyNode freq={freq} playing={this.state.playing[index]} />
              <div style={{ textAlign: 'center' }}>
                <PrecNumber value={cents} precision={1} />
              </div>
              {/* <pre>{valueS}</pre> */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    let playing = clone(this.state.playing)
                    playing[index] = !playing[index]
                    this.setState({ playing })
                  }}
                  style={{background: this.state.playing[index] ? '#f15f55' : '#2196f3'}}
                >
                  {labels[12 - y][x + 4]}
                </button>
                <br />
                <input
                  type="number"
                  min={0} max={9}
                  value={this.state.octave[index] + 4}
                  style={{ width: '3em' }}
                  onChange={(e) => {
                    let octave = clone(this.state.octave)
                    octave[index] = parseInt(e.target.value) - 4
                    this.setState({ octave })
                  }}
                />
              </div>
            </td>
          )
        })}
      </tr>
    )
  }
}

interface State {
  centralC: number,
  preset: 'ji' | 'schismatic' | 'schismatic_optimized7' | 'edo53',
  playing: boolean[],
  save: any[],
  large: boolean
}

interface SaveState {
  octave: { [key: number]: number },
  playing: { [key: number]: boolean },
}

export class Limit5MatrixPlayer extends React.PureComponent<{}, State> {
  private rows: { [key: number]: Row }
  private centralC: MathInput

  constructor (props: {}) {
    super(props)
    this.state = {
      centralC: 440 / Math.pow(2, 9 / 12),
      preset: 'edo53',
      playing: new Array(WIDTH * HEIGHT).fill(false),
      save: new Array(8).fill(null),
      large: true
    }
    this.rows = {}
  }

  save (index: number) {
    let save = clone(this.state.save)
    save[index] = {
      octave: mapValues(this.rows, (o: Row) => o ? o.state.octave : null),
      playing: mapValues(this.rows, (o: Row) => o ? o.state.playing : null)
    }
    if (index == save.length - 1) {
      save.push(null)
    }
    this.setState({ save })
  }

  load (index: number) {
    let save = this.state.save[index]
    Object.keys(save.octave).map((s) => {
      let key = parseInt(s)
      if (this.rows[key] && save.octave[key] !== null) {
        this.rows[key].setState({ octave: save.octave[key] })
      }
    })
    Object.keys(save.playing).map((s) => {
      let key = parseInt(s)
      if (this.rows[key] && save.playing[key] !== null) {
        this.rows[key].setState({ playing: save.playing[key] })
      }
    })
  }

  onPreset (name, preset) {
    this.centralC.setValue(preset.centralC, true)
    this.setState({
      preset: preset.preset,
      large: preset.large,
      save: preset.save
    })
  }

  dumpPreset () {
    return {
      preset: this.state.preset,
      centralC: this.centralC.text(),
      large: this.state.large,
      save: this.state.save,
    }
  }

  render () {
    let large = this.state.large
    this.rows = {}
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Pitch Central C</th>
              <td>
                <MathInput
                  wide default="440 / 2^(9/12)"
                  onChange={(centralC) => {
                    this.setState({ centralC })
                  }} ref={(e) => { if (e) this.centralC = e }} />
              </td>
            </tr>
            <tr>
              <th>Preset</th>
              <td>
                <select onChange={(e) => {
                  let preset = e.target.value
                  if (preset === 'ji' || preset === 'schismatic' ||
                      preset === 'schismatic_optimized7' || preset === 'edo53') {
                    this.setState({ preset })
                  }
                }} value={this.state.preset}>
                  <option value="ji">JI</option>
                  <option value="schismatic">Schismatic-Limit5</option>
                  <option value="schismatic_optimized7">Schismatic-Limit5-optimized7</option>
                  <option value="edo53">EDO53</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>Size</th>
              <td>
                <fieldset>
                  <input
                    type="radio"
                    id="large"
                    value="Large"
                    checked={this.state.large}
                    onChange={() => this.setState({ large: true })}
                  />
                  <label htmlFor="large"> Large</label><br />
                  <input
                    type="radio"
                    id="small"
                    value="Small"
                    checked={!this.state.large}
                    onChange={() => this.setState({ large: false })}
                  />
                  <label htmlFor="small"> Small</label><br />
                </fieldset>
              </td>
            </tr>
            <Presets name='limit5Presets' default={{
              pitch11: '440 / 2^(9/12)',
              large: true,
              preset: 'edo53',
              save: [null, null, null, null]
            }}
              label="Saves"
              onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              {this.state.save.map((_: any, i: number) => (
                <th key={i} style={{padding: '8px'}}>
                  <button
                    onClick={() => this.save(i)}
                    style={{padding: '8px'}}
                  >Save {i + 1}</button>
                </th>
              ))}
            </tr>
            <tr>
              {this.state.save.map((data: SaveState, i: number) => (
                <th key={i} style={{padding: '8px'}}>
                  <button
                    disabled={!data}
                    onClick={() => this.load(i)}
                    style={{padding: '8px'}}
                  >Load {i + 1}</button>
                </th>
              ))}
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th />
              {range(-4, 5).map(x => (
                <th key={x}>{x}</th>
              ))}
            </tr>
            {range(large ? 12 : 4, large ? -13 : -5).map(y => (
              <Row
                y={y} key={y}
                preset={this.state.preset}
                centralC={this.state.centralC}
                ref={(e) => {
                  if (e) this.rows[y] = e
                }}
                // playing={this.state.playing.slice(y * WIDTH, (y + 1) * WIDTH)} TODO?
              />
            ))}
            <tr>
              <td>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
