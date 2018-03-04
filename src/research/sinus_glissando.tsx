import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow, FrequencyNode, WebMIDIHandler } from './audioComponents'
import { concertPitchToC0, ratioToCents, evalMathN, centsToFrequency } from './converters'
import { Presets } from './presets'
import { range, clone } from 'lodash'

type LerpMode = 'linear' | 'overtone' | 'undertone' | 'sin' | 'step'
function lerpFunc(mode: LerpMode, from: number, to: number, time: number, concertPitch: number, timeLeft: number) {
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
    case 'step':
      const LERP_PERIOD = 20
      if (timeLeft > LERP_PERIOD)
        return from
      time = 1 - (timeLeft / LERP_PERIOD)
      return from + (to - from) * time
  }
}

function centsToFreq (cents: number, concertPitch: number) {
  return Math.pow(2, (cents / 1200)) * concertPitch / Math.pow(2, 33 / 12)
}

function freqToCents (freq: number, concertPitch: number) {
  return Math.log2(freq / concertPitch) * 1200 + 3300
}

type Datapoint = { time: number, value: number, mode: LerpMode, trigger?: number }
interface State {
  concertPitch: number,
  data: Datapoint[],
  midiDevice?: string,
  triggerListen?: number
}


interface Preset {
  concertPitch: string,
  data: Datapoint[]
}

export class SinusGlissando extends React.PureComponent<{}, State> {
  private players: CompactFrequencyPlayer[]
  private inputs: MathInput[]
  private concertPitch?: MathInput
  private player?: GlissandoPlayer

  constructor (props: {}) {
    super(props)
    let octaves = 1
    this.state = {
      concertPitch: 440,
      data: [
        { value: 0, time: 1000, mode: 'linear' },
        { value: 1200, time: 1000, mode: 'linear' }
      ],
      triggerListen: undefined
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

  preparePlayerProps () {
    let accTime: number[] = []
    let last = 0
    for (let data of this.state.data) {
      accTime.push(last)
      last += data.time
    }
    return {
      ...this.state,
      data: this.state.data.map((data, i) => {
        return {
          ...data,
          time: accTime[i]
        }
      })
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
                { value: 1200, time: 1000, mode: 'linear' },
                { value: 2400, time: 1000, mode: 'linear' }
              ]
            }}
              label="Preset"
              onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
            <GlissandoPlayer {...this.preparePlayerProps()} ref={(e) => {if (e) this.player = e}} />
            <WebMIDIHandler onKey={(id, mag) => {
              if (this.state.triggerListen !== undefined) {
                let data = this.state.data.slice(0)
                data[this.state.triggerListen].trigger = id
                this.setState({ data, triggerListen: undefined })
              } else if (this.player)
                this.player.onMidi(id, mag)
            }} />
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>Cents</th>
              <th>Δms</th>
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
                <td>{this.state.data.slice(0, i).reduce((acc, e) => acc + e.time, 0)}</td>
                <td>
                  <select onChange={(e) => {
                    let mode = e.target.value
                    let data = this.state.data.slice(0)
                    if (mode === 'linear' || mode === 'sin' || mode === 'undertone' || mode === 'overtone' || mode === 'step')
                      data[i].mode = mode
                    this.setState({ data })
                  }} value={mode}>
                    <option value="linear">Linear</option>
                    <option value="overtone">Overtone</option>
                    <option value="undertone">Undertone</option>
                    <option value="sin">Sinus</option>
                    <option value="step">Step +20ms</option>
                  </select>
                </td>
                <td>
                  {this.state.triggerListen == i ? (
                    <button>Press Key...</button>
                  ) : (
                    this.state.data[i].trigger !== undefined ? (
                      <button style={{
                        background: 'white', color: 'black'
                      }} onClick={() => {
                        let data = this.state.data.slice(0)
                        data[i].trigger = undefined
                        this.setState({ data })
                      }}>Trigger: {this.state.data[i].trigger}</button>
                    ) : (
                      <button style={{
                        background: 'white', color: 'grey'
                      }} onClick={() => this.setState({ triggerListen: i })}>Set Trigger</button>
                    )
                  )}
                </td>
                {i == (this.state.data.length - 1) ? (
                  <th>
                    <button onClick={() => {
                      let data = this.state.data.slice(0)
                      data.push({ time: 1000, value, mode })
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
  private pauseAt?: number
  private points: Datapoint[]
  private pointsReversed: Datapoint[]

  constructor (props: State) {
    super(props)
    this.interval = null
    this.points = []
    this.pointsReversed = []

    this.state = this.updateFromProps(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.togglePause = this.togglePause.bind(this)
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
    return lerpFunc(lerpFrom.mode, lerpFrom.value, lerpTo.value, progress, this.props.concertPitch, lerpTo.time - time)
  }

  update () {
    if (this.state.paused)
      return
    let time = this.state.time || 0
    let freq = centsToFreq(this.valueAt(time), this.props.concertPitch)

    if (this.pauseAt !== undefined && time >= this.pauseAt) {
      this.setState({ paused: true })
      this.pauseAt = undefined
      return
    }

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

  start (triggerIdx?: number) {
    if (this.interval)
      return

    let time = 0
    if (triggerIdx !== undefined) {
      time = this.props.data[triggerIdx].time
      let nextTrigger = this.props.data.slice(triggerIdx + 1).find(d => d.trigger !== undefined)
      this.pauseAt = (nextTrigger && nextTrigger.time) || (this.last && this.last.time)
    }

    let freq = centsToFreq(this.valueAt(time), this.props.concertPitch)
    this.setState({ time, paused: false, freq })
    this.interval = setInterval(this.update.bind(this), UPDATE_INTERVAL)
  }

  onMidi (id: number, mag: number) {
    let idx = this.props.data.findIndex((e) => e.trigger === id)
    if (idx !== -1) {
      if (this.state.paused && this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
      this.start(idx)
    }
  }

  togglePause () {
    this.setState({ paused: !this.state.paused })
  }

  componentWillUnmount () {
    if (this.interval !== null)
      clearInterval(this.interval)
    this.interval = null
  }

  render () {
    return (
      <tr>
        <th>
          Player
        </th>
        <th>
          {this.state.time === null ? (
            <button onClick={() => this.start()}>Play</button>
          ) : (
            <button onClick={this.stop} style={{color: 'red'}}>Stop</button>
          )}
        </th>
        <th>
          <button
            onClick={this.togglePause}
            disabled={this.state.time === null}
            style={{color: this.state.paused ? '#61ff61' : 'white'}}
          >Pause</button>
        </th>
        <th>{this.state.time} {this.state.time !== null ? "ms" : null}</th>
        <th>
          {this.state.time !== null ? (
          "#" + (this.points.length - this.pointsReversed.findIndex((v) => v.time <= (this.state.time as number)))
          ) : null}
        </th>
        <th><FrequencyNode lerp={true} freq={this.state.freq} playing={this.state.time !== null} /></th>
      </tr>
    )
  }
}