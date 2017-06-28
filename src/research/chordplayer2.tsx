import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'

import { MathInput, NoteDisplay, NoteImage, PlayAllButton } from './components'
import { concertPitchToC0, ratioToCents, processString } from './converters.js'
import { Presets } from './presets'
import { resizeArray } from './utils.js'
import { range } from 'underscore'
import { clone } from 'underline'
import { SoundGenProvider } from './audio.js'

// '1200 -- 400'
let parseInput = (str) => {
  let lerpID = str.split(': ')
  if (lerpID.length > 1) {
    str = lerpID[1]
  }

  let frequencies = str.split('--')
    .map((s) => s.trim())
    .map((freq) => processString(freq, 'mathjs-ignoreerror'))

  let lerpFunc = {
    a: lerpFunctions.linear,
    b: lerpFunctions.inverse_linear,
    c: lerpFunctions.exponential
  }[lerpID[0]]
  return { frequencies, lerpFunc }
}

let lerpFunctions = {
  linear: (t, from, to) => from + (to - from) * t,
  exponential: (t, from, to) => from * Math.pow(to / from, t), // from = 0 => NaN
  inverse_linear: (t, from, to) => (to * from) / ((1 - t) * to + from * t),
  chunky: (t, from, to) => lerpFunctions.inverse_linear(Math.round(t * 2) / 2, from, to),
  sin: (t, from, to) => from + (to - from) * Math.sin(t * Math.PI * 2)
}

class Player extends PureComponent {
  static propTypes = {
    duration: PropTypes.number,
    startFreq: PropTypes.number,
    endFreq: PropTypes.number,
    startVol: PropTypes.number,
    endVol: PropTypes.number,
    freqLerp: PropTypes.func,
    volLerp: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      playing: false
    }
    this.provider = new SoundGenProvider({
      frequency: props.startFreq,
      volume: 0.2
    })
    this.interval = null
    this.startTime = null
  }

  doLerp (duration, changes) {
    this.startTime = window.performance.now()
    let lerpWindow = 5 // 5
    this.interval = setInterval(() => {
      let now = window.performance.now()
      let tFrom = (now - this.startTime) / duration
      let tTo = (now + lerpWindow - this.startTime) / duration
      if (tFrom >= 1) {
        clearInterval(this.interval)
      }
      tFrom = Math.min(tFrom, 1)
      tTo = Math.min(tTo, 1)

      let volTo = this.props.volLerp(tTo, changes.volume[0], changes.volume[1])
      this.provider.setVol(volTo, lerpWindow)

      let freqFrom = this.props.freqLerp(tFrom, changes.freq[0], changes.freq[1])
      let freqTo = this.props.freqLerp(tTo, changes.freq[0], changes.freq[1])
      this.provider.linearRampFrequency(freqFrom, freqTo, lerpWindow)
    }, lerpWindow)
  }

  play () {
    if (!this.props.startFreq || !this.props.endFreq) {
      return false
    }
    this.provider.setVol(this.props.startVol)
    this.provider.play()
    this.doLerp(this.props.duration, {
      freq: [this.props.startFreq, this.props.endFreq],
      volume: [this.props.startVol, this.props.endVol]
    })
    this.setState({playing: true})
  }

  stop () {
    this.provider.stop()
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.setState({playing: false})
  }

  valInvalid () { return (!this.props.startFreq || !this.props.endFreq) }
  setPlaying (isPlaying) {
    if (this.valInvalid()) { return }
    if (isPlaying) {
      this.play()
    } else {
      this.stop()
    }
  }

  render () {
    return (
      <div>
        <button onClick={() => {
          let playing = !this.state.playing
          this.setPlaying(playing)
          this.setState({playing})
        }} style={{background: this.state.playing ? '#f15f55' : '#2196f3'}}>
          Play
        </button>
      </div>
    )
  }
}

export class ChordPlayer2 extends PureComponent {
  constructor (props) {
    super(props)
    let rows = 8
    this.state = {
      rows,
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(rows).fill(null).map(
        () => range(6).map((i) => i === 0 ? '1 / 1 -- 1 / 2' : '')
      ),
      volume: new Array(rows).fill(null).map(
        () => range(6).map((i) => '50')
      ),
      duration: new Array(rows).fill(2000),
      mode: 'ratio'
    }
    this.players = []
  }

  setRows (rows, cb) {
    if (rows < this.state.rows) {
      this.players.filter((_, i) => i >= rows)
        .forEach((row) => {
          row.forEach((player) => player.setPlaying(false))
        })
    }
    let data = resizeArray(this.state.data, rows, () => range(6).map((i) => i === 0 ? '1' : ''))
    this.setState({ rows, data }, cb)
  }

  onPreset (name, preset) {
    this.setRows(preset.rows, () => {
      this.concertPitch.setValue(preset.concertPitch, true)
      this.pitch11.setValue(preset.pitch11, true)
      this.setState({
        mode: preset.mode,
        data: preset.data,
        duration: preset.duration
      })
    })
  }

  dumpPreset () {
    return {
      rows: this.state.rows,
      mode: this.state.mode,
      concertPitch: this.concertPitch.text(),
      pitch11: this.pitch11.text(),
      data: this.state.data,
      duration: this.state.duration
    }
  }

  rowTable (row, rowi) {
    return (
      <table>
        <tbody>
          <tr>
            <th>Row</th>
            <th>{rowi + 1}</th>
            <th>Duration (ms)</th>
            <th>
              <input type="number" value={this.state.duration[rowi]} onChange={(e) => {
                let duration = this.state.duration::clone()
                duration[rowi] = parseInt(e.target.value)
                this.setState({ duration })
              }} style={{width: '5em'}} />
            </th>
          </tr>
          <tr>
            <th>
              Volume:
            </th>
            {row.map((_, i) =>
              <th key={i}>
                <input type="text" value={this.state.volume[rowi][i]} onChange={(e) => {
                  let volume = this.state.volume::clone()
                  volume[rowi][i] = e.target.value
                  this.setState({ volume })
                }} style={{width: '8em'}} />
              </th>
            )}
          </tr>
          <tr>
            <th>
              Pitch:
            </th>
            {row.map((_, i) =>
              <th key={i}>
                <input type="text" value={this.state.data[rowi][i]} onChange={(e) => {
                  let data = this.state.data::clone()
                  data[rowi][i] = e.target.value
                  this.setState({ data })
                }} style={{width: '8em'}} />
              </th>
            )}
          </tr>
          <tr>
            <th>
              <PlayAllButton playerRefs={this.players[rowi]} />
            </th>
            {row.map((_, i) => {
              let freqText = this.state.data[rowi][i]
              let freqFunc = {
                ratio: (pitch, r) => pitch * r,
                cents: (pitch, r) => pitch * Math.pow(2, r / 1200)
              }[this.state.mode]
              let input = parseInput(freqText)
              let frequencies = input.frequencies
              let freqStart = freqFunc(this.state.pitch11, frequencies[0])
              let freqEnd = freqFunc(this.state.pitch11, frequencies[1] || frequencies[0])
              let vol = parseInput(this.state.volume[rowi][i])
              let volumes = vol.frequencies.map((v) => v / 100)

              return (
                <td key={i}>
                  <Player startFreq={freqStart} endFreq={freqEnd}
                      startVol={volumes[0]} endVol={volumes[1] || volumes[0]}
                      freqLerp={input.lerpFunc || lerpFunctions.exponential}
                      volLerp={vol.lerpFunc || lerpFunctions.linear}
                      duration={this.state.duration[rowi]}
                      ref={(ref) => {
                        if (this.players[rowi]) {
                          this.players[rowi][i] = ref
                        }
                      }} />
                </td>
              )
            })}
          </tr>
        </tbody>
      </table>
    )
  }

  render () {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)

    this.players = range(this.state.rows).map(() => new Array(6).fill(null))
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror"
                  default={440}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} ref={(e) => { this.concertPitch = e }} />
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} ref={(e) => { this.pitch11 = e }} />
              </th>
              <th>
                <NoteImage cents={cents} />
              </th>
              <th>
                <NoteDisplay cents={cents} />
              </th>
            </tr>
            <tr>
              <th>Mode</th>
              <th>
                <select onChange={(e) => {
                  this.setState({ mode: e.target.value })
                }} value={this.state.mode}>
                  <option value="ratio">Ratio</option>
                  <option value="cents">Cents</option>
                </select>
              </th>
            </tr>
            <tr>
              <th>Rows</th>
              <th>
                <input type="number" name="rows"
                  min="1" value={this.state.rows}
                  style={{width: '3em'}} ref={(e) => { this.rows = e }}
                  onChange={(event) => {
                    let rows = parseInt(event.target.value)
                    this.setRows(rows)
                  }}/>
              </th>
            </tr>
            <Presets name='chordPlayer2Presets'
              onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
          </tbody>
        </table>
        <table>
          <tbody>
            {this.state.data.map((row, rowi) => {
              return (
                <tr key={rowi}>
                  <td>
                    {this.rowTable(row, rowi)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
