import React from 'react'
import PropTypes from 'prop-types'

import { keys, map, clone, extend } from 'underline'

import { CompactFrequencyPlayer } from './components.jsx'

import { presets } from './kithara_presets'

import {
  calcState,
  fracToCent,
  calcOvertone
} from './kithara_math'

let nonNaN = (n) => isNaN(n) ? '' : n

let tdWidth = {
  width: '7em',
  maxWidth: '7em'
}

export class RatioInput extends React.Component {
  static propTypes = {
    changeCB: PropTypes.func,
    data: PropTypes.number,
    disabled: PropTypes.bool,
    highlighted: PropTypes.bool,
    isUpper: PropTypes.bool,
    tabIndex: PropTypes.number
  }
  handleChange (c) {
    if (this.props.changeCB) {
      this.props.changeCB(this.input.value)
    }
  }

  render () {
    let invalid = isNaN(this.props.data)
    let style = {
      textAlign: 'center',
      width: '5em',
      maxWidth: '5em'
    }
    if (invalid) {
      style['borderColor'] = 'red'
    }
    if (this.props.disabled) {
      style['color'] = '#444'
    }
    if (this.props.highlighted) {
      style['borderColor'] = 'blue'
    }
    let tdStyle = this.props.isUpper ? Object.assign({
      borderBottom: '2px black solid'
    }, tdWidth) : tdWidth
    let val = nonNaN(this.props.data)
    return (
      <td style={tdStyle}>
        <input type='text' tabIndex={this.props.tabIndex}
          value={val} onChange={this.handleChange.bind(this)}
          style={style} ref={(e) => { this.input = e }} disabled={this.props.disabled} />
      </td>
    )
  }
}

class LowerInput extends React.Component {
  static propTypes = {
    isUpper: PropTypes.bool,
    frac: PropTypes.any,
    octave: PropTypes.any,
    index: PropTypes.number,
    tabIndex: PropTypes.number,
    setOvertone: PropTypes.func,
    applyCB: PropTypes.func,
    setOctaveCB: PropTypes.func,
    overtone: PropTypes.any
  }
  getImg () {
    // TODO: components/NoteImage
    let a = Math.floor((fracToCent(this.props.frac) + 100 / 12) * 72 / 1200)
    let x = this.props.octave + Math.floor(a / 72)
    let mod = (a, b) => {
      return ((a % b) + b) % b
    }
    let y = mod(a + 42, 72)
    return `/static/kithara_calc/${x}_${y}.png`
  }

  getCentDisp () {
    let charmap = {
      0: '♮g',
      1: '♭a',
      2: '♮a',
      3: '♭h',
      4: '♮h',
      5: '♮c',
      6: '♯c',
      7: '♮d',
      8: '♭e',
      9: '♮e',
      10: '♮f',
      11: '♯f',
      12: '♮g'
    }

    let cents = fracToCent(this.props.frac)
    let near = Math.round(cents / 100) * 100
    let diff = Math.round((cents - near) * 10) / 10

    return charmap[near / 100] + (diff > 0 ? ' +' : ' ') + diff + '¢'
  }

  getFreq () {
    let cents = fracToCent(this.props.frac) + this.props.octave * 1200
    let g0 = (440 / Math.pow(2, 50 / 12))
    // ♮c - ♯f => octave - 1
    let octave = (cents / 100) % 12 >= 5 ? this.props.octave - 1 : this.props.octave
    return g0 * Math.pow(2, octave) * (this.props.frac[0] / this.props.frac[1])
  }

  render () {
    // let cents = Math.round(fracToCent(this.props.frac) * 10) / 10
    let cents = this.getCentDisp()
    let octave = nonNaN(this.props.octave)
    let invalid = isNaN(this.props.octave) || this.props.octave == null
    let style = invalid ? {width: '3.5em', heigh: '1.5em', borderColor: 'red'} : {width: '3.5em', heigh: '1.5em'}
    if (this.props.index === 0) {
      if (this.props.isUpper) {
        return (<td style={{visibility: 'hidden'}}></td>)
      } else {
        let overtone = this.props.overtone || ''
        return (
          <td style={tdWidth}>
            <a data-row='1' onClick={() => { this.props.applyCB() }}>apply identity</a>
            <br />
            <br />
            <span>
              Overtone:
              <input type='text' tabIndex={this.props.tabIndex}
                placeholder='' value={overtone}
                onChange={(d) => {
                  this.props.setOvertone(parseInt(d.target.value))
                }} style={{width: '3.5em', heigh: '1.5em'}} />
            </span>
          </td>
        )
      }
    }
    return (
      <td style={tdWidth}>
        <span className='subs'>
          Octave:
          <input type='text' tabIndex={this.props.tabIndex} style={style}
            placeholder='3' value={octave}
            onChange={(d) => {
              this.props.setOctaveCB(this.props.index, parseInt(d.target.value))
            }} />
        </span>
        <div className='cents'>{cents}</div>
        {this.props.isUpper ? null : (
          <a data-row='1' onClick={() => { this.props.applyCB() }}>apply</a>
        )}
        <img style={{maxWidth: '5em'}} src={this.getImg()} />
        <CompactFrequencyPlayer freq={this.getFreq()} />
      </td>
    )
  }
}

class Row extends React.Component {
  static propTypes = {
    data: PropTypes.array,
    overtone: PropTypes.any,
    isUpper: PropTypes.bool,
    setCB: PropTypes.func,
    setOvertone: PropTypes.func,
    setOctave: PropTypes.func,
    applyCB: PropTypes.func
  }
  render () {
    let data = this.props.data
    let isUpper = this.props.isUpper

    let firstRow = []
    let secondRow = []
    let thirdRow = []

    data.map((d, index) => {
      let firstCB = (val) => { this.props.setCB(index, [parseInt(val), d.ratio[1]]) }
      let secondCB = (val) => { this.props.setCB(index, [d.ratio[0], parseInt(val)]) }
      let spacer = <td style={{padding: '0.7em', visibility: 'hidden', maxWidth: '5em', width: '5em'}} key={`spacer_${index}`} />
      let tabIndexBase = index * 3 + (isUpper ? 1 : 999)
      firstRow.push(<RatioInput tabIndex={tabIndexBase} data={d.ratio[0]} key={`input_${index}`} changeCB={firstCB} isUpper />)
      firstRow.push(spacer)
      secondRow.push(<RatioInput tabIndex={tabIndexBase + 1} data={d.ratio[1]} key={`input_${index}`} changeCB={secondCB} />)
      secondRow.push(spacer)
      thirdRow.push(
        <LowerInput isUpper={isUpper} frac={d.ratio} octave={d.octave}
          tabIndex={tabIndexBase + 2} key={`input_${index}`}
          applyCB={() => { this.props.applyCB(index) }}
          index={index} setOctaveCB={this.props.setOctave}
          setOvertone={this.props.setOvertone} overtone={this.props.overtone} />
      )
      thirdRow.push(spacer)
    })
    return (
      <table>
        <tbody>
          <tr>{firstRow}</tr>
          <tr>{secondRow}</tr>
          <tr>{thirdRow}</tr>
        </tbody>
      </table>
    )
  }
}

export class KitharaCalc extends React.Component {
  constructor (props) {
    super(props)
    this.state = this.setStateFromPreset('Kithara I', 'Hexad 1, green', false)
  }
  setStateFromPreset (instrument, preset, setState = true) {
    let p = presets[instrument][preset]
    let row = p.map((a, index) => {
      if (index === 0) {
        return {
          ratio: [a[0], a[1]],
          type: a[2]
        }
      }
      return {
        ratio: [a[0], a[1]],
        octave: a[2]
      }
    })
    let state = {
      upperRow: row,
      lowerRow: calcState(row, {
        ratio: [3, 2],
        octave: 3,
        index: 2
      }),
      instrument: instrument,
      preset: preset
    }
    if (setState) {
      this.setState(state)
    }
    return state
  }
  setPreset (d) {
    let preset = d.target.value
    this.setStateFromPreset(this.state.instrument, preset)
  }
  setInstrument (d) {
    let instrument = d.target.value
    let preset = Object.keys(presets[instrument])[0]
    this.setStateFromPreset(instrument, preset)
  }
  setRatioCB (isUpper, index, ratio) {
    let state = this.state::clone()
    if (isUpper) {
      state.upperRow[index].ratio = ratio
    } else {
      state.lowerRow[index].ratio = ratio
    }
    this.setState(state)
    if (isUpper) {
      this.state = state
      this.handleApply(1)
    }
  }
  setOctave (isUpper, index, octave) {
    let state = this.state::clone()
    if (isUpper) {
      state.upperRow[index].octave = octave
    } else {
      state.lowerRow[index].octave = octave
    }
    this.setState(state)
    if (isUpper) {
      this.state = state
      this.handleApply(1)
    } else {
      this.state = state
      this.handleApply(index)
    }
  }
  setOvertone (overtone) {
    if (!overtone) {
      this.clearOvertone()
      return
    }
    let state = this.state::clone()
    state.lowerRow[0].overtone = overtone
    state.lowerRow = calcOvertone(state, overtone)
    this.setState(state)
  }
  clearOvertone () {
    let lowerRow = this.state.lowerRow.map(e => {
      return {
        ratio: e.ratio,
        octave: e.octave,
        overtone: null
      }
    })
    this.setState({ lowerRow })
  }
  handleApply (index) {
    let state = this.state::extend({
      upperRow: this.state.upperRow,
      lowerRow: calcState(this.state.upperRow, {
        ratio: this.state.lowerRow[index].ratio,
        octave: this.state.lowerRow[index].octave,
        index: index
      })
    })
    this.setState(state)
    this.clearOvertone()
  }
  render () {
    return (
      <div style={{padding: '1em'}}>
        <div style={{padding: '1em'}}>
          Instrument: &nbsp;
          <select onChange={this.setInstrument.bind(this)}>
            {presets::keys()::map((key) => {
              return <option key={key} value={key}>{key}</option>
            })}
          </select>
          &nbsp; Preset: &nbsp;
          <select onChange={this.setPreset.bind(this)}>
            {presets[this.state.instrument]::keys()::map((key) => {
              return <option key={key} value={key}>{key}</option>
            })}
          </select>
        </div>
        <Row isUpper={true} data={this.state.upperRow}
          setCB={this.setRatioCB.bind(this, true)}
          setOctave={this.setOctave.bind(this, true)}
          applyCB={this.handleApply.bind(this)} />
        <Row isUpper={false} data={this.state.lowerRow}
          setCB={this.setRatioCB.bind(this, false)}
          setOctave={this.setOctave.bind(this, false)}
          applyCB={this.handleApply.bind(this)}
          overtone={this.state.lowerRow[0].overtone}
          setOvertone={this.setOvertone.bind(this)} />
      </div>
    )
  }
}
