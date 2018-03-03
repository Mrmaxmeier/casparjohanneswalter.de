import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow, FrequencyNode } from './audioComponents'
import { concertPitchToC0, ratioToCents, evalMathN, centsToFrequency } from './converters'
import { Presets } from './presets'
import { range, clone } from 'lodash'

type LerpMode = 'linear' | 'overtone' | 'undertone' | 'sin'
function lerpFunc(mode: LerpMode, from: number, to: number, time: number, concertPitch: number) {
  switch (mode) {
    case 'linear':
      return from + (to - from) * time
    case 'overtone':
      return freqToCents(
        centsToFreq(from, concertPitch) + (centsToFreq(to, concertPitch) - centsToFreq(from, concertPitch)) * time,
        concertPitch
      )
    case 'undertone':
      return freqToCents(
        (centsToFreq(from, concertPitch) * centsToFreq(to, concertPitch)) /
        (centsToFreq(from, concertPitch) + (1 - time) * (centsToFreq(to, concertPitch) - centsToFreq(from, concertPitch))),
        concertPitch
      )
    case 'sin':
      let t = Math.cos((time + 1) * Math.PI) / 2 + 0.5
      return from + (to - from) * t
  }
}

function centsToFreq (cents: number, concertPitch: number) {
  return Math.pow(2, (cents / 1200)) * concertPitch / Math.pow(2, 33 / 12)
}

function freqToCents (freq: number, concertPitch: number) {
  return Math.log2(freq / concertPitch) * 1200 + 3300
}

type Datapoint = { time: number, value: number, mode: LerpMode }
interface State {
  concertPitch: number,
  data: Datapoint[]
}


interface Preset {
  concertPitch: string,
  data: Datapoint[]
}

export class SinusGlissando extends React.PureComponent<{}, State> {
  private players: CompactFrequencyPlayer[]
  private inputs: MathInput[]
  private concertPitch?: MathInput

  constructor (props: {}) {
    super(props)
    let octaves = 1
    this.state = {
      concertPitch: 440,
      data: [
        { value: 0, time: 0, mode: 'linear' },
        { value: 1200, time: 1000, mode: 'linear' }
      ]
    }
    this.players = []
    this.inputs = []
  }

  onPreset (name: string, preset: Preset) {
    if (this.concertPitch)
      this.concertPitch.setValue(preset.concertPitch, true)
    this.setState({
      data: preset.data,
    })
  }

  dumpPreset () {
    return {
      data: this.state.data,
      concertPitch: this.concertPitch && this.concertPitch.text(),
    }
  }

  render () {

    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  default={440}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} ref={(e) => { if (e) this.concertPitch = e }}/>
              </th>
            </tr>
            <Presets name='sinusGlissandoPresets' default={{
              concertPitch: "440",
              data: [
                { value: 0, time: 0, mode: 'linear' },
                { value: 1200, time: 1000, mode: 'linear' }
              ]
            }}
              label="Preset"
              onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
            <GlissandoPlayer {...this.state} />
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Cents</th>
              <th>ms</th>
            </tr>
            {this.state.data.map(({ time, value, mode }, i) =>
              <tr key={i}>
                <th>#{i + 1}</th>
                <td>
                  <input type="number"
                    value={value}
                    style={{width: '5em'}}
                    onChange={(e) => {
                      let data = this.state.data.slice(0)
                      data[i].value = parseInt(e.target.value)
                      this.setState({ data })
                    }}
                  />
                </td>
                <td>
                  <input type="number" min={0} step={1}
                    value={time}
                    style={{width: '5em'}}
                    onChange={(e) => {
                      let data = this.state.data.slice(0)
                      data[i].time = parseInt(e.target.value)
                      this.setState({ data })
                    }}
                  />
                </td>
                <td>
                  <select onChange={(e) => {
                    let mode = e.target.value
                    let data = this.state.data.slice(0)
                    if (mode === 'linear' || mode === 'sin' || mode === 'undertone' || mode === 'overtone')
                      data[i].mode = mode
                    this.setState({ data })
                  }} value={mode}>
                    <option value="linear">Linear</option>
                    <option value="overtone">Overtone</option>
                    <option value="undertone">Undertone</option>
                    <option value="sin">Sinus</option>
                  </select>
                </td>
                {i == (this.state.data.length - 1) ? (
                  <th>
                    <button onClick={() => {
                      let data = this.state.data.slice(0)
                      data.push({ time: time + 1000, value, mode })
                      this.setState({ data })
                    }}>+</button>
                  </th>
                ) : null}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    )
  }
}

interface GPState {
  time: number | null,
  freq: number,
  paused: boolean
}

const UPDATE_INTERVAL = 5 // ms
class GlissandoPlayer extends React.Component<State, GPState> {
  private interval: number | null
  private first?: Datapoint
  private last?: Datapoint
  private points: Datapoint[]
  private pointsReversed: Datapoint[]
  constructor (props: State) {
    super(props)
    this.state = this.updateFromProps(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.togglePause = this.togglePause.bind(this)
    this.interval = null
    this.points = []
    this.pointsReversed = []
  }

  updateFromProps (props: State) {
    if (this.interval)
      clearInterval(this.interval)
    this.interval = null
    this.first = props.data[0]
    this.last = props.data[props.data.length - 1]
    this.points = props.data
    this.pointsReversed = props.data.slice(0).reverse()
    return { time: null, freq: this.first.value, paused: false }
  }

  componentWillReceiveProps (props: State) {
    this.setState(this.updateFromProps(props))
  }

  valueAt(time: number) {
    let lerpFrom = this.pointsReversed.find((v) => v.time <= time)
    let lerpTo = this.points.find((v) => v.time >= time)
    if (lerpFrom === undefined || lerpTo === undefined)
      return 0
    let dTime = lerpTo.time - lerpFrom.time
    let dValue = lerpTo.value - lerpFrom.value
    let progress = (time - lerpFrom.time) / dTime
    if (isNaN(progress))
      progress = 1
    return lerpFunc(lerpFrom.mode, lerpFrom.value, lerpTo.value, progress, this.props.concertPitch)
  }

  update () {
    if (this.state.paused)
      return
    let time = this.state.time || 0
    let freq = centsToFreq(this.valueAt(time), this.props.concertPitch)

    if (this.last && time >= this.last.time) {
      this.stop()
    } else {
      this.setState({ time: time + UPDATE_INTERVAL, freq })
    }
  }

  stop () {
    if (this.interval)
      clearInterval(this.interval)
    this.interval = null
    this.setState({ time: null })
  }

  start () {
    if (this.interval)
      return

    this.setState({ time: 0, paused: false })
    this.interval = setInterval(this.update.bind(this), UPDATE_INTERVAL)
  }

  togglePause () {
    this.setState({ paused: !this.state.paused })
  }

  componentWillUnmount () {
    if (this.interval !== null)
      clearInterval(this.interval)
  }

  render () {
    return (
      <tr>
        <th>
          Player
        </th>
        <th>
          {this.state.time === null ? (
            <button onClick={this.start}>Play</button>
          ) : (
            <button onClick={this.stop} style={{color: 'red'}}>Stop</button>
          )}
        </th>
        <th>
          <button
            onClick={this.togglePause}
            disabled={this.state.time === null}
            style={{color: this.state.paused ? 'green' : 'white'}}
          >Pause</button>
        </th>
        <th>{this.state.time} {this.state.time !== null ? "ms" : null}</th>
        <th>
          {this.state.time !== null ? (
          "#" + (this.points.length - this.pointsReversed.findIndex((v) => v.time <= (this.state.time as number)))
          ) : null}
        </th>
        <th><FrequencyNode freq={this.state.freq} playing={this.state.time !== null} /></th>
      </tr>
    )
  }
}