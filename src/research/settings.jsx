import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { clone } from 'underline'

import { MathInput, NoteDisplay, NoteImage } from './components.jsx'
import { concertPitchToC0, ratioToCents } from './converters.js'


export class Settings extends PureComponent {
  static propTypes = {
    updateState: PropTypes.func
  }

  constructor (props) {
    super(props)
    this.state = {
      value: this.cls().default
    }
  }

  onValue (value) {
    this.setState({ value })
    if (this.props.updateState) {
      this.props.updateState(value, this.cls())
    }
  }

  static state = (...list) => {
    return list.reduce((v, setting) => {
      if (typeof setting.default === 'object') {
        Object.assign(v, setting.default)
      } else {
        v[setting.field] = setting.default
      }
      return v
    }, {})
  }

  static updateState = (component) => {
    return (val, cls) => {
      if (typeof cls.default === 'object') {
        component.setState(val)
      } else {
        component.setState({ [cls.field]: val })
      }
    }
  }

  static onPreset = (settings, preset) => {
    for (let setting of settings) {
      let cls = setting.cls()
      if (setting.deserialize) {
        setting.deserialize(preset)
      } else if (typeof cls.default === 'object') {
        setting.setState({value: preset}) // TODO: filter preset keys
      } else {
        setting.setState({
          [cls.field]: preset[cls.field] || cls.default
        })
      }
    }
  }

  static dumpPreset = (settings, current) => {
    let state = current::clone()
    for (let setting of settings) {
      if (setting.serialize) {
        setting.serialize(state)
      }
    }
    return state
  }
}

export class ConcertPitchSetting extends Settings {
  static field = 'concertPitch';
  static default = 440;
  cls () { return ConcertPitchSetting }
  dump () { return this.refs.input.getValue() }
  serialize (v) { v.concertPitch = this.refs.input.text() }
  deserialize (preset) { this.refs.input.setValue(preset.concertPitch, true) }

  render () {
    return (
      <tr>
        <th>Concert Pitch a4</th>
        <th>
          <MathInput
            wide asKind="mathjs-ignoreerror"
            default={440} ref='input'
            onChange={this.onValue.bind(this)} />
        </th>
      </tr>
    )
  }
}

export class Pitch11Setting extends Settings {
  static field = 'pitch11';
  static default = 440 / 9 * 8;
  cls () { return Pitch11Setting }
  serialize (v) { v.pitch11 = this.refs.input.text() }
  deserialize (preset) { this.refs.input.setValue(preset.pitch11, true) }
  render () {
    let c0 = concertPitchToC0(this.props.concertPitch)
    let cents = ratioToCents(this.state.value / c0)
    return (
      <tr>
        <th>Pitch 1 / 1</th>
        <th>
          <MathInput
            wide asKind="mathjs-ignoreerror" default="440 / 9 * 8"
            onChange={this.onValue.bind(this)} ref='input' />
        </th>
        <th>
          <NoteImage cents={cents} />
        </th>
        <th>
          <NoteDisplay cents={cents} />
        </th>
      </tr>
    )
  }
}

export class RatioCentsModeSetting extends Settings {
  static field = 'mode';
  static default = 'ratio';
  cls () { return RatioCentsModeSetting }
  render () {
    return (
      <tr>
        <th>Mode</th>
        <th>
          <select onChange={(e) => {
            this.onValue(e.target.value)
          }} value={this.state.mode}>
            <option value="ratio">Ratio</option>
            <option value="cents">Cents</option>
          </select>
        </th>
      </tr>
    )
  }
}

export class MutedSetting extends Settings {
  static field = 'muted';
  static default = false;
  cls () { return MutedSetting }
  serialize (v) { delete v.muted }
  render () {
    let muted = this.state.value
    return (
      <tr>
        <th>Mute</th>
        <th>
          <button onClick={() => {
            this.onValue(!muted)
          }}>{muted ? 'un' : ''}mute</button>
        </th>
      </tr>
    )
  }
}
