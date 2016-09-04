import React, { Component } from 'react'
import Pizzicato from 'pizzicato'
import math from 'mathjs'

import { processString } from './converters.js'

export class MathInput extends Component {
  static propTypes = {
    default: React.PropTypes.any,
    onChange: React.PropTypes.func,
    asKind: React.PropTypes.string,
    wide: React.PropTypes.bool
  }
  constructor (props) {
    super(props)
    this.state = {
      value: props.default
    }
  }
  set (value) {
    this.refs.elem.value = value
    this.setState({ value })
    if (this.props.onChange) {
      this.props.onChange(processString(value, this.props.asKind))
    }
  }
  render () {
    let style = this.props.wide ? {
      width: '5em',
      height: '1.5em'
    } : {
      width: '3.5em',
      height: '1.5em'
    }
    return (
      <input type='text' ref='elem'
        defaultValue={this.state.value}
        onChange={(d) => {
          let value = this.refs.elem.value
          this.setState({value})
          if (this.props.onChange) {
            this.props.onChange(processString(value, this.props.asKind))
          }
        }}
        style={style}
        />
    )
  }
}

export class PrecNumber extends Component {
  static propTypes = {
    value: React.PropTypes.number,
    precision: React.PropTypes.number,
    digits: React.PropTypes.number,
    style: React.PropTypes.object
  }
  render () {
    let precision = this.props.precision || 2
    let s = math.format(this.props.value, {precision, notation: 'fixed'})
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

export class FreqPlayer extends Component {
  static propTypes = {
    freq: React.PropTypes.number,
    custom: React.PropTypes.bool,
    inTable: React.PropTypes.bool,
    showTypePicker: React.PropTypes.bool,
    defaultVolume: React.PropTypes.number
  }
  constructor (props) {
    super(props)
    this.state = {
      isPlaying: false,
      volume: props.defaultVolume || 0.5,
      type: 'sine'
    }
    this.setWave(props.freq, this.state.volume * 0.2, this.state.type)
  }
  setWave (frequency, volume, type) {
    this.wave = new Pizzicato.Sound({
      source: 'wave',
      options: {
        type,
        frequency,
        volume
      }
    })
  }
  setPlaying (isPlaying) {
    if (isPlaying) {
      this.wave.play()
    } else {
      this.wave.stop()
    }
    this.setState({ isPlaying })
  }
  componentWillUnmount () {
    if (this.state.isPlaying) {
      this.wave.stop()
    }
  }
  componentDidUpdate (prevProps, prevState) {
    this.wave.frequency = this.props.freq
    this.wave.volume = this.state.volume * 0.2
    if (this.state.type !== prevState.type) {
      this.wave.stop()
      this.setWave(this.props.freq, this.state.volume * 0.2, this.state.type)
      if (this.state.isPlaying) {
        this.wave.play()
      }
    }
  }

  renderBody () {
    let isPlaying = this.state.isPlaying
    return (
      <tr>
        <th>
          Frequency:
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
          <input type="range"
            min={0} max={1} step={0.01} value={this.state.volume}
            onChange={(event) => {
              console.log('onChange event', event.target.value)
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
              let type = event.target.value
              this.setState({ type })
            }}>
              <option value="sine">Sine</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
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

export class RequiresJS extends Component {
  render () {
    return (
      <noscript>
        For full functionality of this page it is necessary to enable JavaScript.
        Here are the <a href="http://www.enable-javascript.com" target="_blank">
          instructions how to enable JavaScript in your web browser
        </a>.
      </noscript>
    )
  }
}
