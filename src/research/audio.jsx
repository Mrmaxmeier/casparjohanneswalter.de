import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import Pizzicato from 'pizzicato'
import { max, sqrt, log } from 'mathjs'

let audio = {}
if (typeof window !== 'undefined') {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  audio.context = new AudioContext()
  audio.masterNode = audio.context.createGain()
  audio.masterNode.gain.value = 0.25
  audio.masterNode.connect(audio.context.destination)
  audio.activeNodes = 0
  audio.nodeCount = 0
  window.audio = audio
}

const defaultAttack = 0.04
const defaultRelease = 0.04

export class FrequencyNode extends PureComponent {
  static propTypes = {
    freq: PropTypes.number,
    volume: PropTypes.number,
    playing: PropTypes.bool
  }

  constructor (props) {
    super(props)

    this.count = 16
    this.initialized = false
    this._waves = null
    this.active = 0

    if (props.playing) {
      this.init()
      this.applyAttack()
    }

    this.unload = this.unload.bind(this)
  }

  componentWillUnmount () {
    if (!this.initialized) { return }
    this.stopWithRelease()
    clearTimeout(this.unloadTimeout)
    this.unloadTimeout = setTimeout(this.unload, 50)
  }

  componentDidUpdate (prevProps, prevState) {
    let props = this.props
    if (prevProps.playing && !props.playing) {
      this.stopWithRelease()
    }
    if (this.initialized && (prevProps.volume !== props.volume || prevProps.freq !== props.freq)) {
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

  volume (index) {
    let refVol = this.props.volume !== undefined ? this.props.volume : 0.5
    let refFreq = max(this.props.freq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return (Math.pow(sC, index) * refVol) || 0
  }

  frequency (index) {
    let octave = 2
    return Math.pow(octave, log(index + 1, 2)) * this.props.freq
  }

  init () {
    if (typeof window === 'undefined' || this.initialized) { return }
    this._waves = Array(this.count).fill()
    this._waves = this._waves.map((_, index) => {
      let node = audio.context.createOscillator()
      node.type = 'sine'
      node.frequency.value = this.frequency(index)

      node.gainNode = audio.context.createGain()
      node.gainNode.gain.value = this.volume(index)

      node.fadeNode = audio.context.createGain()
      node.fadeNode.gain.value = 0

      node.connect(node.gainNode)
      node.gainNode.connect(node.fadeNode)
      node.fadeNode.connect(audio.masterNode)

      node.start()

      return node
    })
    audio.nodeCount += this._waves.length
    this.initialized = true
  }

  applyAttack () {
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
    this._waves.forEach((wave, index) => {
      if (!wave) { return }
      let currentValue = wave.fadeNode.gain.value
      wave.fadeNode.gain.cancelScheduledValues(audio.context.currentTime)
      wave.fadeNode.gain.setValueAtTime(currentValue, audio.context.currentTime)

      let remainingReleaseTime = wave.fadeNode.gain.value * defaultRelease
      wave.fadeNode.gain.setValueAtTime(wave.fadeNode.gain.value, Pizzicato.context.currentTime)
      wave.fadeNode.gain.linearRampToValueAtTime(0.00001, Pizzicato.context.currentTime + remainingReleaseTime)

      // wave.stop(Pizzicato.context.currentTime + remainingReleaseTime)
    })
    audio.activeNodes -= this.active
    this.active = 0
    clearTimeout(this.unloadTimeout)
    this.unloadTimeout = setTimeout(this.unload, 10000)
  }

  unload () {
    if (!this.initialized) { return }
    this.initialized = false
    this._waves.forEach((wave) => {
      wave.stop()
      wave.disconnect()
      wave.fadeNode.disconnect()
      wave.gainNode.disconnect()
    })
    audio.nodeCount -= this._waves.length
    this._waves = null
  }
}

export class AudioControllerRow extends Component {
  constructor (props) {
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
              audio.masterNode.gain.value = e.target.value
              this.setState({
                volume: e.target.value
              })
            }}
          />
        </td>
        <td>{Math.round(this.state.volume * 400)}%</td>
      </tr>
    )
  }
}

export class AudioController extends Component {
  constructor (props) {
    super(props)
    this.state = {
      activeNodes: 0
    }
    this.processor = createAudioMeter(audio.context)
    window.processor = this.processor
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

function createAudioMeter (audioContext, clipLevel, averaging, clipLag) {
  let processor = audioContext.createScriptProcessor(512)
  processor.onaudioprocess = volumeAudioProcess
  processor.clipping = false
  processor.lastClip = 0
  processor.volume = 0
  processor.clipLevel = clipLevel || 0.98
  processor.averaging = averaging || 0.95
  processor.clipLag = clipLag || 750

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.connect(audioContext.destination)
  audio.masterNode.connect(processor)

  processor.checkClipping = () => {
    if (!processor.clipping) { return false }

    if ((processor.lastClip + processor.clipLag) < window.performance.now()) {
      processor.clipping = false
    }
    return processor.clipping
  }

  processor.shutdown = () => {
    processor.disconnect()
    processor.onaudioprocess = null
  }

  return processor
}

function volumeAudioProcess (event) {
  let buf = event.inputBuffer.getChannelData(0)
  let sum = 0
  let x

  window.buf = buf

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
