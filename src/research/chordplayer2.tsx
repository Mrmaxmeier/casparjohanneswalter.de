import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, PlayAllButton } from './components'
import { concertPitchToC0, ratioToCents, evalMathN } from './converters'
import { Presets } from './presets'
import { resizeArray } from './utils'
import { range, clone } from 'lodash'
import { SoundGenProvider } from './audio'

// '1200 -- 400'
let parseInput = (str: string) => {
  let lerpID = str.split(': ')
  if (lerpID.length > 1) {
    str = lerpID[1]
  }

  let frequencies = str.split('--')
    .map((s) => s.trim())
    .map((freq) => evalMathN(freq))
    .filter((freq) => freq !== null) as number[]

  let lerpFuncs: { [key: string]: LerpFunc} = {
    a: lerpFunctions.linear,
    b: lerpFunctions.inverse_linear,
    c: lerpFunctions.exponential
  }
  let lerpFunc = lerpFuncs[lerpID[0]]
  return { frequencies, lerpFunc }
}

type LerpFunc = (t: number, from: number, to: number) => number
let lerpFunctions = {
  linear:         (t: number, from: number, to: number) => from + (to - from) * t,
  exponential:    (t: number, from: number, to: number) => from * Math.pow(to / from, t), // from = 0 => NaN
  inverse_linear: (t: number, from: number, to: number) => (to * from) / ((1 - t) * to + from * t),
  chunky:         (t: number, from: number, to: number) => lerpFunctions.inverse_linear(Math.round(t * 2) / 2, from, to),
  sin:            (t: number, from: number, to: number) => from + (to - from) * Math.sin(t * Math.PI * 2)
}

interface PlayerProps {
  duration: number,
  startFreq: number,
  endFreq: number,
  startVol: number,
  endVol: number,
  freqLerp: (time: number, from: number, to_: number) => number,
  volLerp: (time: number, from: number, to_: number) => number,
}

class Player extends React.PureComponent<PlayerProps, { playing: boolean }> {
  private provider: SoundGenProvider
  private interval: number
  private startTime: number
  constructor (props: PlayerProps) {
    super(props)
    this.state = {
      playing: false
    }
    this.provider = new SoundGenProvider({
      frequency: props.startFreq,
      volume: 0.2
    })
  }

  doLerp (duration: number, changes: { volume: number[], freq: number[] }) {
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
  setPlaying (isPlaying: boolean) {
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

interface ChordPlayer2State {
  rows: number,
  concertPitch: number,
  pitch11: number,
  data: string[][],
  volume: string[][],
  duration: number[],
  mode: 'ratio' | 'cents'
}

interface Preset {
  rows: number,
  concertPitch: string,
  pitch11: string,
  mode: 'ratio' | 'cents',
  data: string[][],
  duration: number[]
}

export class ChordPlayer2 extends React.PureComponent<{}, ChordPlayer2State> {
  private players: Player[][]
  private concertPitch: MathInput
  private pitch11: MathInput
  private rows: HTMLInputElement
  constructor (props: {}) {
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

  setRows (rows: number, cb?: () => void) {
    if (rows < this.state.rows) {
      this.players.filter((_, i) => i >= rows)
        .forEach((row) => {
          row.forEach((player) => player.setPlaying(false))
        })
    }
    let data = resizeArray(this.state.data, rows, () => range(6).map((i) => i === 0 ? '1' : ''))
    this.setState({ rows, data }, cb)
  }

  onPreset (name: string, preset: Preset) {
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

  rowTable (row: string[], rowi: number) {
    return (
      <table>
        <tbody>
          <tr>
            <th>Row</th>
            <th>{rowi + 1}</th>
            <th>Duration (ms)</th>
            <th>
              <input type="number" value={this.state.duration[rowi]} onChange={(e) => {
                let duration = clone(this.state.duration)
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
                  let volume = clone(this.state.volume)
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
                  let data = clone(this.state.data)
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
                ratio: (pitch: number, r: number) => pitch * r,
                cents: (pitch: number, r: number) => pitch * Math.pow(2, r / 1200)
              }[this.state.mode]
              let input = parseInput(freqText)
              let frequencies = input.frequencies
              let freqStart = freqFunc(this.state.pitch11, frequencies[0])
              let freqEnd = freqFunc(this.state.pitch11, frequencies[1] || frequencies[0])
              let vol = parseInput(this.state.volume[rowi][i])
              let volumes = vol.frequencies.map((v) => v && v / 100)

              return (
                <td key={i}>
                  <Player startFreq={freqStart} endFreq={freqEnd}
                      startVol={volumes[0]} endVol={volumes[1] || volumes[0]}
                      freqLerp={input.lerpFunc || lerpFunctions.exponential}
                      volLerp={vol.lerpFunc || lerpFunctions.linear}
                      duration={this.state.duration[rowi]}
                      ref={(ref) => {
                        if (this.players[rowi] && ref) {
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
                  wide
                  default={440}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} ref={(e) => { if(e) this.concertPitch = e }} />
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} ref={(e) => { if (e) this.pitch11 = e }} />
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
                  let mode = e.target.value
                  if (mode === 'ratio' || mode === 'cents')
                    this.setState({ mode })
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
                  style={{width: '3em'}} ref={(e) => { if (e) this.rows = e }}
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
