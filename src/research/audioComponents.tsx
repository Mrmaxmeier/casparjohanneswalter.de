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
  const theAudioContext = (
    (window as any).AudioContext || (window as any).webkitAudioContext
  )
  let context = new theAudioContext() as AudioContext
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
  volume?: number,
  playing: boolean,
  lerp?: boolean,
}

interface Wave {
  node: OscillatorNode
  gainNode: GainNode
  fadeNode: GainNode
}

export class FrequencyNode extends React.PureComponent<FNProps, {}> {
  private count: number
  private _waves?: Wave[]
  private active: number
  private unloadTimeout?: number

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
    if (this.unloadTimeout)
      window.clearTimeout(this.unloadTimeout)
    this.unloadTimeout = window.setTimeout(this.unload, 50)
  }

  componentDidUpdate (prevProps: FNProps, prevState: {}) {
    let props = this.props
    if (prevProps.playing && !props.playing) {
      this.stopWithRelease()
    }
    if (this._waves !== undefined && (prevProps.volume !== props.volume || prevProps.freq !== props.freq)) {
      this._waves.forEach((wave, index) => {
        if (wave && this.props.freq) {
          let freq = this.frequency(index)
          let vol = this.volume(index)
          // TODO: does this check out?
          if (freq >= 22050) {
            this._set(wave, 0, 22050)
          } else {
            this._set(wave, vol, freq)
          }
        }
      })
    }
    if (!prevProps.playing && props.playing) {
      this.init()
      this.applyAttack()
    }
  }


  // TODO: transition from real-time API
  _set(wave: Wave, gain: number, freq: number, time?: number) {
    const timeConstant = 15 // 10-20ms was default pre Chrome M64
    const startTime = time || audio.context.currentTime
    /*
    if (false) { // this.props.lerp === undefined || this.props.lerp {
      wave.gainNode.gain.setTargetAtTime(
        gain,
        startTime,
        timeConstant
      )
      wave.node.frequency.setTargetAtTime(
        freq,
        startTime,
        timeConstant
      )
    } else {
      */
      wave.gainNode.gain.setValueAtTime(gain, startTime)
      wave.node.frequency.setValueAtTime(freq, startTime)
    // }
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

    // Chrome M66 introduces aggressive auto-mute and might stop our AudioContext.
    // This hopes to resumes the audio context as part of a user gesture
    audio.context.resume()

    this._waves = new Array(this.count).fill(null).map((_: null, index: number) => {
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

      return {
        gainNode, fadeNode, node
      } 
    })
    audio.nodeCount += this.count
  }

  applyAttack () {
    if (this._waves === undefined) { return }
    if (this.unloadTimeout)
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
    if (this.unloadTimeout)
      window.clearTimeout(this.unloadTimeout)
    this.unloadTimeout = window.setTimeout(this.unload, 10000)
  }

  unload () {
    if (this._waves === undefined) { return }
    this._waves.forEach((wave) => {
      wave.node.stop()
      wave.node.disconnect()
      wave.fadeNode.disconnect()
      wave.gainNode.disconnect()
    })
    audio.nodeCount -= this._waves.length
    this._waves = undefined
  }
}

interface AudioControllerRowProps {
  withMidi?: boolean
}
export class AudioControllerRow extends React.Component<AudioControllerRowProps, { volume: number, midiId?: number | null }> {
  constructor (props: AudioControllerRowProps) {
    super(props)
    this.state = {
      volume: 0.25,
      midiId: undefined
    }
  }

  onMidi (val: number, vol: number) {
    if (this.state.midiId === null) {
      this.setState({ midiId: val })
    } else if (this.state.midiId === val) {
      let volume = (vol / 127) / 4
      audio.masterNode.gain.value = volume
      this.setState({ volume })
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
        {this.props.withMidi ? (
          <td>
            {this.state.midiId === null ? (
              <button>Turn Knob...</button>
            ) : (
              this.state.midiId !== null && this.state.midiId !== undefined ? (
                <button style={{
                  background: 'white', color: 'black'
                }} onClick={() => {
                  this.setState({ midiId: undefined })
                }}>Knob: {this.state.midiId}</button>
              ) : (
                <button style={{
                  background: 'white', color: 'grey'
                }} onClick={() => this.setState({ midiId: null })}>Set Knob</button>
              )
            )}
          </td>
        ) : null}
      </tr>
    )
  }
}

export class AudioController extends React.Component<{}, { activeNodes: number, nodeCount: number, volume: number }> {
  private processor?: AudioMeter
  private interval?: number
  constructor (props: {}) {
    super(props)
    this.state = {
      activeNodes: 0,
      nodeCount: 0,
      volume: 0
    }
    if (typeof window === 'undefined') { return }
    this.processor = createAudioMeter(audio.context)
  }

  componentDidMount () {
    if (this.processor === undefined) { return }
    const processor = this.processor
    this.interval = window.setInterval(() => {
      this.setState({
        activeNodes: audio.activeNodes,
        nodeCount: audio.nodeCount,
        volume: Math.round(processor.volume * 100) * 3
      })
    }, 250)
  }

  componentWillUnmount () {
    if (this.interval)
      clearInterval(this.interval)
  }

  render () {
    if (this.processor === undefined) { return null }
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
                <span style={{ color: this.processor.checkClipping() ? 'red' : undefined, fontFamily: 'monospace' }}>
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

interface AudioMeter {
  clipping: boolean
  lastClip: number
  volume: number
  clipLag: number
  clipLevel: number
  averaging: number
  checkClipping: () => boolean
  shutdown: () => void
  node: ScriptProcessorNode
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
      processor.node.disconnect()
      processor.node.onaudioprocess = (_: AudioProcessingEvent) => {}
    },
    node: node
  }
  processor.node.onaudioprocess = (event: AudioProcessingEvent) => volumeAudioProcess(processor, event)

  // this will have no effect, since we don't copy the input to the output,
  // but works around a current Chrome bug.
  processor.node.connect(audioContext.destination)
  audio.masterNode.connect(processor.node)

  return processor
}


function volumeAudioProcess (meter: AudioMeter, event: AudioProcessingEvent) {
  let buf = event.inputBuffer.getChannelData(0)
  let sum = 0
  let x

  // Do a root-mean-square on the samples: sum up the squares...
  for (let i = 0; i < buf.length; i++) {
    x = buf[i]
    if (Math.abs(x) >= meter.clipLevel) {
      meter.clipping = true
      meter.lastClip = window.performance.now()
    }
    sum += x * x
  }

  // ... then take the square root of the sum.
  var rms = Math.sqrt(sum / buf.length)

  // Now smooth this out with the averaging factor applied
  // to the previous sample - take the max here because we
  // want "fast attack, slow release."
  meter.volume = Math.max(rms, meter.volume * meter.averaging)
}


interface WebMIDIHandlerProps {
  onKey: (id: number, mag: number) => void
}

interface WebMIDIHandlerState {
  selectedDevice?: WebMidi.MIDIInput,
  devices: WebMidi.MIDIInput[]
}

export class WebMIDIHandler extends React.Component<WebMIDIHandlerProps, WebMIDIHandlerState> {
  public supported: boolean

  constructor(props: WebMIDIHandlerProps) {
    super(props)
    if (navigator.requestMIDIAccess !== undefined) {
      this.supported = true
			console.log("Initializing MIDI...");
			navigator.requestMIDIAccess().then( this.onSuccess, console.error ); // get midi access
    } else {
      this.supported = false
    }
    this.state = {
      selectedDevice: undefined,
      devices: []
    }
  }

  onSuccess = (access: WebMidi.MIDIAccess) => {

    let inputs = access.inputs;

    console.log("Found " + inputs.size + " MIDI input(s)");

    let inputArr = Array.from(inputs.values())
    let devices = []
    for (let input of inputArr) {
      input.onmidimessage = this.handleMIDIMessage
      devices.push(input)
    }
    this.setState({ devices })
  }


  handleMIDIMessage = (event: WebMidi.MIDIMessageEvent) => {
    // console.log(JSON.stringify(event.data))
    if (event.data.length === 3) {
      this.props.onKey(event.data[1], event.data[2])
    }
  }

  render () {
    return (
      <tr>
        <th>Midi Trigger</th>
        <td>
          <select onChange={(e) => {
            let key = e.target.value
            let selectedDevice = this.state.devices.find((device) => device.name === key)
            this.setState({ selectedDevice })
          }} value={(this.state.selectedDevice && this.state.selectedDevice.name) || "disabled"}>
            <option value="disabled">Disabled</option>
            {this.state.devices.map((device, i) => <option key={i} value={device.name}>{device.name}</option>)}
          </select>
        </td>
      </tr>
    )
  }
}
