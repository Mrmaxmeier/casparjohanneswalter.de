import React, {PureComponent} from 'react'
import { range, mapValues } from 'lodash'
import PropTypes from 'prop-types'

import { MathInput, PrecNumber } from './components.jsx'
import { FrequencyNode, AudioController, AudioControllerRow } from './audio.jsx'
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

class Row extends PureComponent {
  static propTypes = {
    preset: PropTypes.string,
    y: PropTypes.number,
    centralC: PropTypes.number
  }

  constructor (props) {
    super(props)
    this.state = {
      octave: new Array(WIDTH).fill(0),
      playing: new Array(WIDTH).fill(false)
    }
  }

  data (x, y) {
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
              <center>
                <PrecNumber value={cents} precision={1} />
              </center>
              {/* <pre>{valueS}</pre> */}
              <center>
                <button
                  onClick={() => {
                    let playing = [].concat(this.state.playing)
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
                    let octave = [].concat(this.state.octave)
                    octave[index] = e.target.value - 4
                    this.setState({ octave })
                  }}
                />
              </center>
            </td>
          )
        })}
      </tr>
    )
  }
}

export class Limit5MatrixPlayer extends PureComponent {
  constructor (props) {
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

  save (index) {
    let save = [].concat(this.state.save)
    save[index] = {
      octave: mapValues(this.rows, (o) => o ? o.state.octave : null),
      playing: mapValues(this.rows, (o) => o ? o.state.playing : null)
    }
    if (index == save.length - 1) {
      save.push(null)
    }
    this.setState({ save })
  }

  load (index) {
    let save = this.state.save[index]
    Object.keys(save.octave).map((key) => {
      if (this.rows[key] && save.octave[key] !== null) {
        this.rows[key].setState({ octave: save.octave[key] })
      }
    })
    Object.keys(save.playing).map((key) => {
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
                  wide asKind="mathjs-ignoreerror" default="440 / 2^(9/12)"
                  onChange={(centralC) => {
                    this.setState({ centralC })
                  }} ref={(e) => { this.centralC = e }} />
              </td>
            </tr>
            <tr>
              <th>Preset</th>
              <td>
                <select onChange={(e) => {
                  let preset = e.target.value
                  this.setState({preset})
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
              {this.state.save.map((_, i) => (
                <th key={i} style={{padding: '8px'}}>
                  <button
                    onClick={() => this.save(i)}
                    style={{padding: '8px'}}
                  >Save {i + 1}</button>
                </th>
              ))}
            </tr>
            <tr>
              {this.state.save.map((data, i) => (
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
                  this.rows[y] = e
                }}
                playing={this.state.playing.slice(y * WIDTH, (y + 1) * WIDTH)}
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
