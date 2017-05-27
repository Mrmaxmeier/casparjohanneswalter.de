import React, {PureComponent} from 'react'
import { range, mapValues } from 'lodash'
import PropTypes from 'prop-types'

import { MathInput, PrecNumber, FrequencyNode } from './components.jsx'
import { normalizeOctave, ratioToCents, processString } from './converters.js'

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
    // TODO: no eval
    return {
      ji: `3^(${y}) * 5^(${x})`,
      tanaka: `3^(${y} + -${x} * 8)`,
      edo53: `2^(((31 * ${y} + 17 * ${x}) % 53) / 53)`
    }[this.props.preset]
  }

  render () {
    let { y, centralC } = this.props
    return (
      <tr key={y}>
        <th>{y}</th>
        {range(-4, 5).map(x => {
          const index = (x + 4)
          let valueS = this.data(x, y)
          let value = processString(valueS)
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
      save: new Array(8).fill(null)
    }
    this.rows = {}
  }

  save (index) {
    let save = [].concat(this.state.save)
    save[index] = {
      octave: mapValues(this.rows, (o) => o.state.octave),
      playing: mapValues(this.rows, (o) => o.state.playing)
    }
    this.setState({ save })
  }

  load (index) {
    let save = this.state.save[index]
    Object.keys(save.octave).map((key) => {
      this.rows[key].setState({ octave: save.octave[key] })
    })
    Object.keys(save.playing).map((key) => {
      this.rows[key].setState({ playing: save.playing[key] })
    })
  }

  render () {
    return (
      <div>
        <table>
          <tbody>
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
                  <option value="tanaka">Tanaka</option>
                  <option value="edo53">EDO53</option>
                </select>
              </td>
            </tr>
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
            {range(12, -13).map(y => (
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
