import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { format } from 'mathjs'
import { map } from 'underline'

import { processString, centsToOctave, centsToNote, centsToNoteDiff } from './converters.js'
import { AudioProvider, SoundGenProvider } from './audio.js'

export class MathInput extends PureComponent {
  static propTypes = {
    default: PropTypes.any,
    onChange: PropTypes.func,
    asKind: PropTypes.string,
    wide: PropTypes.bool,
    size: PropTypes.number
  }
  constructor (props) {
    super(props)
    this.state = {
      value: props.default,
      error: false
    }
  }
  setValue (value, callOnChange) {
    this.elem.value = value
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
      <input type='text' ref={(e) => { this.elem = e }}
        defaultValue={this.state.value}
        onChange={(d) => {
          let value = this.elem.value
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
    return this.elem.value
  }
}

export class FractionInput extends PureComponent {
  static propTypes = {
    onValue: PropTypes.func,
    disabled: PropTypes.bool,
    value: PropTypes.object
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
                ref={(e) => { this.input = e }}
                style={style} disabled={this.props.disabled} />
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
                ref={(e) => { this.input = e }}
                style={style} disabled={this.props.disabled} />
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

export class PrecNumber extends PureComponent {
  static propTypes = {
    value: PropTypes.number,
    precision: PropTypes.number,
    digits: PropTypes.number,
    style: PropTypes.object
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
    defaultMin: PropTypes.number,
    defaultMax: PropTypes.number,
    step: PropTypes.number,
    onChange: PropTypes.func
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
      this.max.setValue(value)
      this.setState({ max: value, value: value })
    } else if (value < min) {
      this.min.setValue(value)
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
          }} ref={(e) => { this.min = e }} />
        <input type="range" style={{width: '20em', verticalAlign: 'middle'}}
          min={min} max={max} step={step} value={this.state.value}
          onChange={(event) => {
            let value = parseFloat(event.target.value)
            this.setState({ value })
            this.props.onChange(value)
          }} ref={(e) => { this.slider = e }} />
        <MathInput default={this.props.defaultMax}
          asKind="mathjs-ignoreerror"
          onChange={(max) => {
            this.setState({max})
          }} ref={(e) => { this.max = e }} />
      </span>
    )
  }
}

export class FreqPlayer extends PureComponent {
  static propTypes = {
    freq: PropTypes.number,
    custom: PropTypes.bool,
    inTable: PropTypes.bool,
    showTypePicker: PropTypes.bool,
    defaultVolume: PropTypes.number,
    text: PropTypes.string
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

  valInvalid () { return !this.props.freq }
  setPlaying (isPlaying) {
    if (this.valInvalid()) { return }
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
    freq: PropTypes.number,
    muted: PropTypes.bool,
    buttonStyle: PropTypes.object,
    text: PropTypes.string
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

  valInvalid () { return !this.props.freq }
  setPlaying (isPlaying) {
    if (this.valInvalid()) { return }
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
    cents: PropTypes.number
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
    cents: PropTypes.number
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

export class StringValueVisualisation extends PureComponent {
  static propTypes = {
    values: PropTypes.objectOf(PropTypes.number)
  }

  render () {
    return (
      <div style={{position: 'relative'}}>
        <img src={require('../../assets/KlavierSaite.png')} />
        {this.props.values::map((value, color) => {
          let offset = value * 196 + 0.9
          if (value === undefined || value === null) {
            return null
          }
          return (
            <div key={color} style={{
              background: color,
              width: '5px',
              height: '30%',
              position: 'absolute',
              top: '40%',
              left: 'calc(' + offset + '% - 2px)'
            }} />
          )
        })}
      </div>
    )
  }
}

export class PlayAllButton extends PureComponent {
  static propTypes = {
    playerRefs: PropTypes.array,
    disabled: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      active: false
    }
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.setState({ active: !this.state.active })
    this.props.playerRefs.forEach((p, i) => {
      if ((!p.valInvalid()) || this.state.active) {
        p.setPlaying(!this.state.active)
      }
    })
  }

  render () {
    return (
      <button
        style={{background: this.state.active ? '#f15f55' : '#2196f3'}}
        onClick={this.toggle} disabled={this.props.disabled}>
        {this.state.active ? 'Stop All' : 'Play All'}
      </button>
    )
  }
}
