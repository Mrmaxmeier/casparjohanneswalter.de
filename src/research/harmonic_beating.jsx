import React, {Component} from 'react'

import { MathInput, PrecNumber, NoteImage, CompactFrequencyPlayer } from './components.jsx'
import { ratioToCents, concertPitchToC0 } from './converters.js'

export class HarmonicBeatingCalculator extends Component {

  constructor (props) {
    super(props)
    this.state = {
      concertPitch: 442,
      commonTone: null,
      partialLeft: null,
      partialRight: null,
      valsLeft: new Array(9).fill(null),
      valsRight: new Array(9).fill(null)
    }
  }

  row (index) {
    let partialLeft = this.state.partialLeft
    let partialRight = this.state.partialRight
    let inLeft = this.state.valsLeft[index]
    let inRight = this.state.valsRight[index]
    let res = null
    let freqLeft = null
    let freqRight = null
    let centsLeft = null
    let centsRight = null
    if (partialLeft && partialRight && inLeft && inRight) {
      res = (inLeft * partialRight) - (inRight * partialLeft)
      let c0 = concertPitchToC0(this.state.concertPitch)
      freqLeft = this.state.commonTone / partialLeft * inLeft
      centsLeft = ratioToCents(freqLeft / c0)
      freqRight = this.state.commonTone / partialRight * inRight
      centsRight = ratioToCents(freqRight / c0)
    }
    return (
      <tr key={index}>
        {freqLeft ? (
          <th><CompactFrequencyPlayer freq={freqLeft} /></th>
        ) : <th />}
        {centsLeft ? (
          <th style={{width: '2em', padding: '0'}}><NoteImage cents={centsLeft} /></th>
        ) : <th />}
        <th>
          <MathInput
            asKind="mathjs-ignoreerror"
            onChange={(val) => {
              let valsLeft = [].concat(this.state.valsLeft)
              valsLeft[index] = val
              this.setState({ valsLeft })
            }} />
        </th>
        <th></th>
        <th>
          <MathInput
            asKind="mathjs-ignoreerror"
            onChange={(val) => {
              let valsRight = [].concat(this.state.valsRight)
              valsRight[index] = val
              this.setState({ valsRight })
            }} />
        </th>
        {centsRight ? (
          <th style={{width: '2em', padding: '0'}}><NoteImage cents={centsRight} /></th>
        ) : <th />}
        {freqRight ? (
          <th><CompactFrequencyPlayer freq={freqRight} /></th>
        ) : <th />}
        {res !== null ? (
          <th>{res}</th>
        ) : null}
      </tr>
    )
  }

  render () {
    let beating = 1 / (this.state.partialLeft * this.state.partialRight) * this.state.commonTone
    let c0 = concertPitchToC0(this.state.concertPitch)
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" default={442}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} />
              </th>
            </tr>
            <tr>
              <th>Fundamental Beating</th>
              <th>
                {(!isNaN(beating)) && beating !== Infinity ? (
                  <span>
                    1 / {this.state.partialLeft * this.state.partialRight} * {this.state.commonTone} = <PrecNumber value={beating} />
                    hz
                  </span>
                ) : null}
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th />
              <th />
              <th>Chord One<br />Partial number</th>
              <th />
              <th>Chord Two<br />Partial number</th>
              <th />
              <th />
              <th>Beating<br />factor</th>
            </tr>
            {new Array(4).fill(null).map((_, i) => this.row(i))}
            <tr>
              {this.state.commonTone ? (
                <th><CompactFrequencyPlayer freq={this.state.commonTone} /></th>
              ) : <th />}
              {this.state.commonTone ? (
                <th style={{width: '2em', padding: '0'}}><NoteImage cents={ratioToCents(this.state.commonTone / c0)} /></th>
              ) : <th />}
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(partialLeft) => {
                    this.setState({ partialLeft })
                  }} />
              </th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(commonTone) => {
                    this.setState({ commonTone })
                  }} /> hz
              </th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(partialRight) => {
                    this.setState({ partialRight })
                  }} />
              </th>
              {this.state.commonTone ? (
                <th style={{width: '2em', padding: '0'}}><NoteImage cents={ratioToCents(this.state.commonTone / c0)} /></th>
              ) : <th />}
              {this.state.commonTone ? (
                <th><CompactFrequencyPlayer freq={this.state.commonTone} /></th>
              ) : <th />}
              <th></th>
            </tr>
            {new Array(5).fill(null).map((_, i) => this.row(i + 4))}
          </tbody>
        </table>
      </div>
    )
  }
}
