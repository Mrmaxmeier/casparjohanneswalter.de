import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow, FrequencyNode } from './audioComponents'
import { concertPitchToC0, ratioToCents, evalMathN, centsToFrequency } from './converters'
import { Presets } from './presets'
import { range, clone } from 'lodash'

type Datapoint = { time: number, value: number }
interface State {
  concertPitch: number,
  mode: 'hertz' | 'cents',
  data: Datapoint[]
}

export class SinusGlissando extends React.PureComponent<{}, State> {
  private players: CompactFrequencyPlayer[]
  private inputs: MathInput[]
  private concertPitch: MathInput

  constructor (props: {}) {
    super(props)
    let octaves = 1
    this.state = {
      concertPitch: 440,
      data: [
        { value: 0, time: 0},
        { value: 1200, time: 1000 }
      ],
      mode: 'hertz'
    }
    this.players = []
    this.inputs = []
  }


  renderElement (index: number, small: boolean, disabled: boolean) {
    let data = this.state.data[index]
    let freq: number | undefined
    return (
      <div>
        <MathInput size={small ? 3.15 : 3.95} default=''
          onChange={(v) => {
            let data = clone(this.state.data)
            // data[index] = v
            this.setState({ data })
          }} ref={(ref) => {
            if (ref) this.inputs[index] = ref
          }} />
      </div>
    )
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
            <tr>
              <th>Mode</th>
              <th>
                <select onChange={(e) => {
                  let mode = e.target.value
                  if (mode === 'hertz' || mode === 'cents')
                    this.setState({ mode })
                }} value={this.state.mode}>
                  <option value="hertz">Hertz</option>
                  <option value="cents">Cents</option>
                </select>
              </th>
            </tr>
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
            {this.state.data.map(({ time, value }, i) =>
              <tr key={i}>
                <th>#{i + 1}</th>
                <td>
                  <MathInput
                    wide default={value}
                    onChange={(value) => {
                      let data = this.state.data.slice(0)
                      data[i].value = value
                      this.setState({ data })
                    }} />
                </td>
                <td>
                  <input type="number" min={0} step={1}
                    value={time}
                    onChange={(e) => {
                      let data = this.state.data.slice(0)
                      data[i].time = parseInt(e.target.value)
                      this.setState({ data })
                    }}
                  />
                </td>
                {i == (this.state.data.length - 1) ? (
                  <th>
                    <button onClick={() => {
                      let data = this.state.data.slice(0)
                      data.push({ time: time + 1000, value })
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
  freq: number
}

const UPDATE_INTERVAL = 5 // ms
class GlissandoPlayer extends React.Component<State, GPState> {
  private interval: number | null
  private first: Datapoint
  private last: Datapoint
  private points: Datapoint[]
  private pointsReversed: Datapoint[]
  constructor (props: State) {
    super(props)
    this.state = this.updateFromProps(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
  }

  toFreq (cents: number) {
    return Math.pow(2, (cents / 1200)) * this.props.concertPitch / Math.pow(2, 33 / 12)
  }

  updateFromProps (props: State) {
    if (this.interval)
      clearInterval(this.interval)
    this.interval = null
    let data
    if (props.mode === 'hertz') {
      data = props.data.map(({ time, value }) => {
        return { time, value: this.toFreq(value)}
      })
    } else {
      data = props.data
    }
    this.first = data[0]
    this.last = data[data.length - 1]
    this.points = data
    this.pointsReversed = data.slice(0).reverse()
    return { time: null, freq: this.first.value }
  }

  componentWillReceiveProps (props: State) {
    this.setState(this.updateFromProps(props))
  }

  valueAt(time: number) {
    let lerpFrom = this.pointsReversed.find((v) => v.time <= time)
    let lerpTo = this.points.find((v) => v.time >= time)
    if (lerpFrom === undefined || lerpTo === undefined)
      return 0
    console.log(lerpFrom.time, lerpFrom.value, lerpTo.time, lerpFrom.value)
    let dTime = lerpTo.time - lerpFrom.time
    let dValue = lerpTo.value - lerpFrom.value
    let progress = (time - lerpFrom.time) / dTime
    if (isNaN(progress))
      progress = 1
    return lerpFrom.value + dValue * progress
  }

  update () {
    let time = this.state.time || 0
    let freq;
    if (this.props.mode === 'cents')
      freq = this.toFreq(this.valueAt(time))
    else
      freq = this.valueAt(time)    

    if (time >= this.last.time) {
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

    this.setState({ time: 0 })
    this.interval = setInterval(this.update.bind(this), UPDATE_INTERVAL)
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
        <th>{this.state.time} {this.state.time !== null ? "ms" : null}</th>
        <th><FrequencyNode freq={this.state.freq} playing={this.state.time !== null} /></th>
      </tr>
    )
  }
}