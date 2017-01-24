import React, { PureComponent } from 'react'
import { format } from 'mathjs'

import { processString, centsToOctave, centsToNote, centsToNoteDiff } from './converters.js'
import { AudioProvider, SoundGenProvider } from './audio.js'

export class MathInput extends PureComponent {
  static propTypes = {
    default: React.PropTypes.any,
    onChange: React.PropTypes.func,
    asKind: React.PropTypes.string,
    wide: React.PropTypes.bool,
    size: React.PropTypes.number
  }
  constructor (props) {
    super(props)
    this.state = {
      value: props.default,
      error: false
    }
  }
  setValue (value, callOnChange) {
    this.refs.elem.value = value
    this.setState({ value })
    if (callOnChange && this.props.onChange) {
      this.props.onChange(processString(value, this.props.asKind))
    }
  }
  render () {
    let style = this.props.wide ? {
      width: '7.5em',
      height: '1.5em'
    } : {
      width: (this.props.size || 3.5) + 'em',
      height: '1.5em'
    }
    if (this.state.error) {
      style['color'] = 'red'
    }
    return (
      <input type='text' ref='elem'
        defaultValue={this.state.value}
        onChange={(d) => {
          let value = this.refs.elem.value
          let result = processString(value, this.props.asKind)
          let error = result === undefined || result.error
          this.setState({ value, error })
          if (this.props.onChange && result !== undefined) {
            this.props.onChange(result)
          }
        }}
        style={style}
        />
    )
  }

  calc (value) {
    return processString(value, this.props.asKind)
  }

  text () {
    return this.refs.elem.value
  }
}

export class FractionInput extends PureComponent {
  static propTypes = {
    onValue: React.PropTypes.func,
    disabled: React.PropTypes.bool,
    value: React.PropTypes.object
  }
  constructor (props) {
    super(props)
    this.state = {
      numerator: null,
      denominator: null
    }
  }

  handleChange (n, d) {
    if (n !== null && d !== null) {
      this.props.onValue({
        numerator: n,
        denominator: d
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.value) {
      this.setState(nextProps.value)
    }
  }

  render () {
    let style = {
      textAlign: 'center',
      width: '5em',
      maxWidth: '5em',
      color: this.props.disabled ? '#444' : null
    }

    let tdStyle = {
      width: '5em',
      maxWidth: '5em',
      padding: 0
    }

    return (
      <table style={{margin: 0}}>
        <tbody>
          <tr>
            <td style={Object.assign({borderBottom: '2px black solid'}, tdStyle)}>
              <input type='text'
                value={this.state.numerator || ''} onChange={(e) => {
                  let numerator = parseFloat(e.target.value) || null
                  this.handleChange(numerator, this.state.denominator)
                  this.setState({ numerator })
                }}
                style={style} ref='input' disabled={this.props.disabled} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>
              <input type='text'
                value={this.state.denominator || ''} onChange={(e) => {
                  let denominator = parseFloat(e.target.value) || null
                  this.handleChange(this.state.numerator, denominator)
                  this.setState({ denominator })
                }}
                style={style} ref='input' disabled={this.props.disabled} />
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export class PrecNumber extends PureComponent {
  static propTypes = {
    value: React.PropTypes.number,
    precision: React.PropTypes.number,
    digits: React.PropTypes.number,
    style: React.PropTypes.object
  }
  render () {
    let precision = this.props.precision || 2
    let s = format(this.props.value, {precision, notation: 'fixed'})
    let style = Object.assign({
      fontFamily: 'monospace'
    }, this.props.style || {})
    if (this.props.digits) {
      let pad = this.props.digits - (s.length) + precision + 1
      for (let i = 0; i < pad; i++) {
        s = ' ' + s
      }
    }
    return <span style={style}>{s}</span>
  }
}

export class SpecificRangeSlider extends PureComponent {
  static propTypes = {
    defaultMin: React.PropTypes.number,
    defaultMax: React.PropTypes.number,
    step: React.PropTypes.number,
    onChange: React.PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      value: (props.defaultMin + props.defaultMax) / 2,
      min: props.defaultMin,
      max: props.defaultMax
    }
  }

  setValue (value, callOnChange) {
    let max = this.state.max
    let min = this.state.min
    if (value > max) {
      this.refs.max.setValue(value)
      this.setState({ max: value, value: value })
    } else if (value < min) {
      this.refs.min.setValue(value)
      this.setState({ min: value, value: value })
    } else {
      this.setState({ value })
    }

    if (callOnChange && this.props.onChange) {
      this.props.onChange(value)
    }
  }

  render () {
    let max = this.state.max
    let min = this.state.min
    let step = this.props.step || max - min < 100 ? 0.1 : 1
    return (
      <span>
        <MathInput default={this.props.defaultMin}
          asKind="mathjs-ignoreerror"
          onChange={(min) => {
            this.setState({min})
          }} ref="min" />
        <input type="range" style={{width: '20em', verticalAlign: 'middle'}}
          min={min} max={max} step={step} value={this.state.value}
          onChange={(event) => {
            let value = parseFloat(event.target.value)
            this.setState({ value })
            this.props.onChange(value)
          }} ref="slider" />
        <MathInput default={this.props.defaultMax}
          asKind="mathjs-ignoreerror"
          onChange={(max) => {
            this.setState({max})
          }} ref="max" />
      </span>
    )
  }
}

export class FreqPlayer extends PureComponent {
  static propTypes = {
    freq: React.PropTypes.number,
    custom: React.PropTypes.bool,
    inTable: React.PropTypes.bool,
    showTypePicker: React.PropTypes.bool,
    defaultVolume: React.PropTypes.number,
    text: React.PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      isPlaying: false,
      volume: props.defaultVolume || 0.5,
      provider: 'sine'
    }
    this.provider = new AudioProvider({
      volume: this.state.volume * 0.2,
      frequency: this.props.freq
    }, 'sine')
  }

  updateProvider () {
    this.provider.setOptions({
      volume: this.state.volume * 0.2,
      frequency: this.props.freq
    })
  }

  setPlaying (isPlaying) {
    if (isPlaying) {
      this.provider.play()
    } else {
      this.provider.stop()
    }
    this.setState({ isPlaying })
  }

  componentWillUnmount () {
    this.provider.unload()
  }

  componentDidUpdate (prevProps, prevState) {
    this.updateProvider()
  }

  renderBody () {
    let isPlaying = this.state.isPlaying
    return (
      <tr>
        <th>
          {this.props.text || 'Frequency:'}
        </th>
        <th>
          {this.props.freq <= 0 || this.props.freq >= 22050 ? (
            <PrecNumber digits={5} value={this.props.freq} style={{color: 'red'}}/>
          ) : <PrecNumber digits={5} value={this.props.freq} />} (hz)
        </th>
        <th>
          <button disabled={isPlaying} onClick={() => {
            this.setPlaying(true)
          }}>Play</button>
        </th>
        <th>
          <button disabled={!isPlaying} onClick={() => {
            this.setPlaying(false)
          }}>Stop</button>
        </th>
        <th>
          <input type="range" style={{verticalAlign: 'middle'}}
            min={0} max={1} step={0.01} value={this.state.volume}
            onChange={(event) => {
              let volume = parseFloat(event.target.value)
              this.setState({ volume })
            }}/>
        </th>
        <th>
          <PrecNumber precision={3} value={this.state.volume} />
        </th>
        {this.props.showTypePicker ? (
          <th>
            <select onChange={(event) => {
              let provider = event.target.value
              console.log('switching audio provider to', provider)
              this.provider.unload()
              if (['sine', 'sawtooth', 'square'].indexOf(provider) !== -1) {
                this.provider = new AudioProvider({}, provider)
              } else if (provider === 'soundgen') {
                this.provider = new SoundGenProvider({})
              } else {
                this.provider = null
              }
              this.updateProvider()
              if (this.state.isPlaying) {
                this.provider.play()
              }
            }}>
              <option value="sine">Sine</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="soundgen">Soundgen</option>
            </select>
          </th>
        ) : null}
      </tr>
    )
  }

  render () {
    if (this.props.inTable) {
      return this.renderBody()
    }
    return (
      <table>
        <tbody>
          {this.renderBody()}
        </tbody>
      </table>
    )
  }
}

export class CompactFrequencyPlayer extends PureComponent {
  static propTypes = {
    freq: React.PropTypes.number,
    muted: React.PropTypes.bool,
    buttonStyle: React.PropTypes.object,
    text: React.PropTypes.string
  }

  constructor (props) {
    super(props)
    this.state = {
      isPlaying: false
    }
    this.provider = new SoundGenProvider({
      volume: 0.5 * 0.2,
      frequency: this.props.freq
    })
  }

  updateProvider () {
    this.provider.setOptions({
      volume: 0.5 * 0.2,
      frequency: this.props.freq
    })
  }

  setPlaying (isPlaying) {
    if (!this.props.freq) {
      return
    }
    if (isPlaying) {
      this.provider.play()
    } else {
      this.provider.stop()
    }
    this.setState({ isPlaying })
  }

  componentWillUnmount () {
    this.provider.unload()
  }

  componentDidUpdate (prevProps, prevState) {
    this.updateProvider()
    if (prevProps.muted !== this.props.muted) {
      if (this.props.muted) {
        this.provider.stop()
      } else if (this.state.isPlaying) {
        this.provider.play()
      }
    }
  }

  render () {
    let isPlaying = this.state.isPlaying
    let style = Object.assign({background: isPlaying ? '#f15f55' : '#2196f3'}, this.props.buttonStyle || {})
    let text = this.props.text ? this.props.text : (isPlaying ? 'Stop' : 'Play')
    return (
      <div>
        <button style={style} onClick={() => {
          this.setPlaying(!isPlaying)
        }} disabled={!this.props.freq || this.props.muted}>{text}</button>
      </div>
    )
  }
}

export class NoteImage extends PureComponent {
  static propTypes = {
    cents: React.PropTypes.number
  }
  render () {
    let a = Math.floor((this.props.cents + 100 / 12) * 72 / 1200)
    let octave = centsToOctave(this.props.cents)
    // let x = this.props.octave + Math.floor(a / 72)
    let mod = (a, b) => {
      return ((a % b) + b) % b
    }
    let y = mod(a, 72)
    return (
      <img style={{width: '6em'}} src={`/static/kithara_calc/${octave}_${y}.png`} />
    )
  }
}

export class NoteDisplay extends PureComponent {
  static propTypes = {
    cents: React.PropTypes.number
  }
  render () {
    let cents = this.props.cents
    let octave = centsToOctave(cents)
    let note = centsToNote(cents)
    let diff = centsToNoteDiff(cents)
    return (
      <div>
          {note}{octave}
          {diff > 0 ? ' +' : ' '}
          {diff !== 0 ? <PrecNumber value={diff} precision={1} /> : null}
          {diff !== 0 ? '¢' : null}
      </div>
    )
  }
}
