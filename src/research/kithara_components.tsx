import * as React from 'react'

import { clone } from 'lodash'
import { CompactFrequencyPlayer } from './components'
import { presets } from './kithara_presets'
import { Fraction } from './math'

import {
  calcState,
  fracToCent,
  calcOvertone
} from './kithara_math'

let nonNaN = (n: number) => isNaN(n) ? '' : n

let tdWidth = {
  width: '7em',
  maxWidth: '7em'
}

interface RatioInputProps {
  changeCB?: (n: number) => void,
  data: number,
  disabled?: boolean,
  highlighted?: boolean,
  isUpper?: boolean,
  tabIndex?: number
}

export class RatioInput extends React.Component<RatioInputProps, {}> {
  private input: HTMLInputElement
  render () {
    let invalid = isNaN(this.props.data)
    let style = {
      textAlign: 'center',
      width: '5em',
      maxWidth: '5em',
      borderColor: this.props.highlighted ? 'blue' : (invalid ? 'red' : undefined),
      color: this.props.disabled ? '#444' : undefined,
    }
    let tdStyle = this.props.isUpper ? Object.assign({
      borderBottom: '2px black solid'
    }, tdWidth) : tdWidth
    let val = nonNaN(this.props.data)
    return (
      <td style={tdStyle}>
        <input type='text' tabIndex={this.props.tabIndex}
          value={val} onChange={(change) => {
            if (this.props.changeCB) {
              this.props.changeCB(parseInt(this.input.value))
            }
          }}
          style={style} ref={(e) => { if (e) this.input = e }} disabled={this.props.disabled} />
      </td>
    )
  }
}

interface LowerInputProps {
    isUpper: boolean,
    frac: Fraction,
    octave: number,
    index: number,
    tabIndex: number,
    setOvertone?: (o: number) => void,
    applyCB: () => void,
    setOctaveCB: (index: number, octave: number) => void,
    overtone?: number
}

class LowerInput extends React.Component<LowerInputProps, {}> {
  getImg () {
    // TODO: components/NoteImage
    let a = Math.floor((fracToCent(this.props.frac) + 100 / 12) * 72 / 1200)
    let x = this.props.octave + Math.floor(a / 72)
    let mod = (a: number, b: number) => {
      return ((a % b) + b) % b
    }
    let y = mod(a + 42, 72)
    return `/static/kithara_calc/${x}_${y}.png`
  }

  getCentDisp () {
    let charmap: { [key: number]: string } = {
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
    return g0 * Math.pow(2, octave) * this.props.frac.value
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
                  if (this.props.setOvertone)
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

interface RowProps {
  data: { ratio: Fraction, octave?: number }[],
  overtone?: number,
  isUpper: boolean,
  setCB: (index: number, ratio: Fraction) => void,
  setOvertone?: (o: number) => void,
  setOctave: (index: number, octave: number) => void,
  applyCB: (index: number) => void
}

class Row extends React.Component<RowProps, {}> {
  render () {
    let data = this.props.data
    let isUpper = this.props.isUpper

    let firstRow: JSX.Element[] = []
    let secondRow: JSX.Element[] = []
    let thirdRow: JSX.Element[] = []

    data.map((d, index) => {
      let firstCB = (val: number) => { this.props.setCB(index, new Fraction(val, d.ratio.denominator)) }
      let secondCB = (val: number) => { this.props.setCB(index, new Fraction(d.ratio.numerator, val)) }
      let spacer = <td style={{padding: '0.7em', visibility: 'hidden', maxWidth: '5em', width: '5em'}} key={`spacer_${index}`} />
      let tabIndexBase = index * 3 + (isUpper ? 1 : 999)
      firstRow.push(<RatioInput tabIndex={tabIndexBase} data={d.ratio.numerator} key={`input_${index}`} changeCB={firstCB} isUpper />)
      firstRow.push(spacer)
      secondRow.push(<RatioInput tabIndex={tabIndexBase + 1} data={d.ratio.denominator} key={`input_${index}`} changeCB={secondCB} />)
      secondRow.push(spacer)
      thirdRow.push(
        <LowerInput isUpper={isUpper} frac={d.ratio} octave={d.octave || NaN}
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

export interface KitharaCalcState {
  lowerRow: {ratio: Fraction, octave?: number, overtone?: number}[],
  upperRow: {ratio: Fraction, octave?: number, overtone?: number}[],
  instrument: string
}

export class KitharaCalc extends React.Component<{}, KitharaCalcState> {
  constructor (props: {}) {
    super(props)
    this.state = this.setStateFromPreset('Kithara I', 'Hexad 1, green', false)
  }

  setStateFromPreset (instrument: string, preset: string, setState = true) {
    let p = presets[instrument][preset]
    let row = p.map((a: number[], index: number) => {
      if (index === 0) {
        return { ratio: new Fraction(a[0], a[1]) }
      }
      return {
        ratio: new Fraction(a[0], a[1]),
        octave: a[2]
      }
    })
    let state = {
      upperRow: row,
      lowerRow: calcState(row, {
        ratio: new Fraction(3, 2),
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

  setRatioCB (isUpper: boolean, index: number, ratio: Fraction) {
    let state = clone(this.state)
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

  setOctave (isUpper: boolean, index: number, octave: number) {
    let state = clone(this.state)
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
  setOvertone (overtone: number) {
    if (!overtone) {
      this.clearOvertone()
      return
    }
    let lowerRow = clone(this.state.lowerRow)
    lowerRow[0].overtone = overtone
    lowerRow = calcOvertone(this.state, overtone)
    this.setState({ lowerRow })
  }
  clearOvertone () {
    let lowerRow = this.state.lowerRow.map(e => {
      return {
        ratio: e.ratio,
        octave: e.octave,
        overtone: undefined
      }
    })
    this.setState({ lowerRow })
  }
  handleApply (index: number) {
    let state = {
      upperRow: this.state.upperRow,
      lowerRow: calcState(this.state.upperRow, {
        ratio: this.state.lowerRow[index].ratio,
        octave: this.state.lowerRow[index].octave,
        index: index
      }),
      ...this.state
    }
    this.setState(state)
    this.clearOvertone()
  }
  render () {
    return (
      <div style={{padding: '1em'}}>
        <div style={{padding: '1em'}}>
          Instrument: &nbsp;
          <select onChange={(d) => {
            let instrument = d.target.value
            let preset = Object.keys(presets[instrument])[0]
            this.setStateFromPreset(instrument, preset)
          }}>
            {Object.keys(presets).map((key) => {
              return <option key={key} value={key}>{key}</option>
            })}
          </select>
          &nbsp; Preset: &nbsp;
          <select onChange={(d) => {
            let preset = d.target.value
            this.setStateFromPreset(this.state.instrument, preset)
          }}>
            {Object.keys(presets[this.state.instrument]).map((key) => {
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
