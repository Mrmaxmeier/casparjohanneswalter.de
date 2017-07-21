import * as React from 'react'
import { max, sqrt, log } from 'mathjs'

interface GlobalAudioContext {
  context: AudioContext,
  masterNode: GainNode,
  activeNodes: number,
  nodeCount: number
}

let audio: GlobalAudioContext
if (typeof window !== 'undefined') {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  let context = new AudioContext()
  let masterNode = context.createGain()
  masterNode.gain.value = 0.25
  masterNode.connect(context.destination)
  audio = {
    context, masterNode,
    activeNodes: 0,
    nodeCount: 0
  }
}

const defaultAttack = 0.04
const defaultRelease = 0.04

interface FNProps {
  freq: number,
  volume: number,
  playing: boolean
}

class Wave extends OscillatorNode {
  gainNode: GainNode
  fadeNode: GainNode
}

export class FrequencyNode extends React.PureComponent<FNProps, {}> {
  private count: number
  private _waves?: Wave[]
  private active: number
  private unloadTimeout: number

  constructor (props: FNProps) {
    super(props)

    this.count = 16
    this.active = 0
    this._waves = undefined

    if (props.playing) {
      this.init()
      this.applyAttack()
    }

    this.unload = this.unload.bind(this)
  }

  componentWillUnmount () {
    if (this._waves === undefined) { return }
    this.stopWithRelease()
    clearTimeout(this.unloadTimeout)
    this.unloadTimeout = setTimeout(this.unload, 50)
  }

  componentDidUpdate (prevProps: FNProps, prevState: {}) {
    let props = this.props
    if (prevProps.playing && !props.playing) {
      this.stopWithRelease()
    }
    if (this._waves !== undefined && (prevProps.volume !== props.volume || prevProps.freq !== props.freq)) {
      this._waves.forEach((wave, index) => {
        if (wave && this.props.freq) {
          wave.gainNode.gain.value = this.volume(index)
          wave.frequency.value = this.frequency(index)
        }
      })
    }
    if (!prevProps.playing && props.playing) {
      this.init()
      this.applyAttack()
    }
  }

  render () { return null }

  volume (index: number) {
    let refVol = this.props.volume !== undefined ? this.props.volume : 0.5
    let refFreq = max(this.props.freq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return (Math.pow(sC, index) * refVol) || 0
  }

  frequency (index: number) {
    let octave = 2
    return Math.pow(octave, Math.log2(index + 1)) * this.props.freq
  }

  init () {
    if (typeof window === 'undefined' || this._waves !== undefined) { return }
    let _waves = Array(this.count).fill()
    this._waves = _waves.map((_: any, index: number) => {
      let node = audio.context.createOscillator()
      node.type = 'sine'
      node.frequency.value = this.frequency(index)

      let gainNode = audio.context.createGain()
      gainNode.gain.value = this.volume(index)

      let fadeNode = audio.context.createGain()
      fadeNode.gain.value = 0

      node.connect(gainNode)
      gainNode.connect(fadeNode)
      fadeNode.connect(audio.masterNode)

      node.start()

      let wave: Wave = {
        gainNode, fadeNode, ...node
      } 

      return wave
    })
    audio.nodeCount += this.count
  }

  applyAttack () {
    if (this._waves === undefined) { return }
    clearTimeout(this.unloadTimeout)
    this._waves.forEach((wave, index) => {
      if (!wave) { return }
      let currentValue = wave.fadeNode.gain.value
      wave.fadeNode.gain.cancelScheduledValues(audio.context.currentTime)
      wave.fadeNode.gain.setValueAtTime(currentValue, audio.context.currentTime)

      let remainingAttackTime = (1 - wave.fadeNode.gain.value) * defaultAttack
      wave.fadeNode.gain.setValueAtTime(wave.fadeNode.gain.value, audio.context.currentTime)
      wave.fadeNode.gain.linearRampToValueAtTime(1, audio.context.currentTime + remainingAttackTime)
    })
    audio.activeNodes += this._waves.length - this.active
    this.active = this._waves.length
  }

  stopWithRelease () {
    if (this._waves === undefined) { return }
    this._waves.forEach((wave, index) => {
      if (!wave) { return }
      let currentValue = wave.fadeNode.gain.value
      wave.fadeNode.gain.cancelScheduledValues(audio.context.currentTime)
      wave.fadeNode.gain.setValueAtTime(currentValue, audio.context.currentTime)

      let remainingReleaseTime = wave.fadeNode.gain.value * defaultRelease
      wave.fadeNode.gain.setValueAtTime(wave.fadeNode.gain.value, audio.context.currentTime)
      wave.fadeNode.gain.linearRampToValueAtTime(0.00001, audio.context.currentTime + remainingReleaseTime)

      // wave.stop(audio.context.currentTime + remainingReleaseTime)
    })
    audio.activeNodes -= this.active
    this.active = 0
    clearTimeout(this.unloadTimeout)
    this.unloadTimeout = setTimeout(this.unload, 10000)
  }

  unload () {
    if (this._waves === undefined) { return }
    this._waves.forEach((wave) => {
      wave.stop()
      wave.disconnect()
      wave.fadeNode.disconnect()
      wave.gainNode.disconnect()
    })
    audio.nodeCount -= this._waves.length
    this._waves = undefined
  }
}

export class AudioControllerRow extends React.Component<{}, { volume: number }> {
  constructor (props: {}) {
    super(props)
    this.state = {
      volume: 0.25
    }
  }

  render () {
    return (
      <tr>
        <th>Master Volume</th>
        <td>
          <input
            type="range"
            min={0.0}
            max={0.25}
            step={0.001}
            value={this.state.volume}
            onChange={(e) => {
              let volume = parseFloat(e.target.value)
              audio.masterNode.gain.value = volume
              this.setState({ volume })
            }}
          />
        </td>
        <td>{Math.round(this.state.volume * 400)}%</td>
      </tr>
    )
  }
}

export class AudioController extends React.Component<{}, { activeNodes: number, nodeCount: number, volume: number }> {
  private processor: AudioMeter
  private interval: number
  constructor (props: {}) {
    super(props)
    this.state = {
      activeNodes: 0,
      nodeCount: 0,
      volume: 0
    }
    this.processor = createAudioMeter(audio.context)
  }

  componentDidMount () {
    this.interval = setInterval(() => {
      this.setState({
        activeNodes: audio.activeNodes,
        nodeCount: audio.nodeCount,
        volume: Math.round(this.processor.volume * 100) * 3
      })
    }, 100)
  }

  componentWillUnmount () { clearInterval(this.interval) }

  render () {
    return (
      <div style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        padding: '4px'
      }}>
        <table>
          <tbody>
            <tr>
              <th>Nodes:</th>
              <td>{this.state.activeNodes} / {this.state.nodeCount}</td>
            </tr>
            <tr>
              <th>Volume:</th>
              <td>
                <span style={{ color: this.processor.checkClipping() ? 'red' : null, fontFamily: 'monospace' }}>
                  {this.state.volume}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

/*
Usage:
audioNode = createAudioMeter(audioContext,clipLevel,averaging,clipLag);
audioContext: the AudioContext you're using.
clipLevel: the level (0 to 1) that you would consider "clipping".
   Defaults to 0.98.
averaging: how "smoothed" you would like the meter to be over time.
   Should be between 0 and less than 1.  Defaults to 0.95.
clipLag: how long you would like the "clipping" indicator to show
   after clipping has occured, in milliseconds.  Defaults to 750ms.
Access the clipping through node.checkClipping(); use node.shutdown to get rid of it.
*/

class AudioMeter extends ScriptProcessorNode {
  clipping: boolean
  lastClip: number
  volume: number
  clipLag: number
  clipLevel: number
  averaging: number
  checkClipping: () => boolean
  shutdown: () => void

  volumeAudioProcess (event: AudioProcessingEvent) {
    let buf = event.inputBuffer.getChannelData(0)
    let sum = 0
    let x

    // Do a root-mean-square on the samples: sum up the squares...
    for (let i = 0; i < buf.length; i++) {
      x = buf[i]
      if (Math.abs(x) >= this.clipLevel) {
        this.clipping = true
        this.lastClip = window.performance.now()
      }
      sum += x * x
    }

    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / buf.length)

    // Now smooth this out with the averaging factor applied
    // to the previous sample - take the max here because we
    // want "fast attack, slow release."
    this.volume = Math.max(rms, this.volume * this.averaging)
  }

}

function createAudioMeter (audioContext: AudioContext, clipLevel?: number, averaging?: number, clipLag?: number) {
  let node = audioContext.createScriptProcessor(1024)
  let processor: AudioMeter = {
    clipping: false,
    lastClip: 0,
    volume: 0,
    clipLevel: clipLevel || 0.98,
    averaging: averaging || 0.95,
    clipLag: clipLag || 750,
    checkClipping: () => {
      if (!processor.clipping) { return false }

      if ((processor.lastClip + processor.clipLag) < window.performance.now()) {
        processor.clipping = false
      }
      return processor.clipping
    },
    shutdown: () => {
      processor.disconnect()
      processor.onaudioprocess = (_: AudioProcessingEvent) => {}
    },
    volumeAudioProcess: new AudioMeter().volumeAudioProcess, // TODO: binding issues
    ...node
  }
  processor.onaudioprocess = processor.volumeAudioProcess.bind(processor)

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination)
  audio.masterNode.connect(processor)

  return processor
}
