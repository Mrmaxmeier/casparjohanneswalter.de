import React, {PureComponent} from 'react'
import { pow, gcd, max, abs, fraction } from 'mathjs'

import { MathInput, PrecNumber, NoteImage, NoteDisplay, CompactFrequencyPlayer } from './components.jsx'
import { ratioToCents } from './converters.js'

const magic = [
  'c', 'c#',
  'd',
  'e♭', 'e',
  'f', 'f#',
  'g',
  'a♭', 'a',
  'b♭', 'b'
]

export class PianoMultiphonicCalculatorII extends PureComponent {

  constructor (props) {
    super(props)
    this.state = {
      concertPitch: 442,
      octave: 0,
      tone: 0
    }
  }

  render () {
    let a = (this.state.concertPitch / pow(2, 3 / 4)) / 16
    let b = a * pow(2, this.state.tone / 12)
    let freq = b * pow(2, this.state.octave)
    let p1 = this.state.p1
    let p2 = this.state.p2
    let error = null
    let fractions = []
    if (p1 && p2) {
      if (gcd(p1, p2) !== 1) {
        error = 'Greatest common divisor: ' + gcd(p1, p2)
      } else {
        let l = [
          max(p1, p2),
          min(p1, p2)
        ]
        while (true) {
          let diff = l[l.length - 2] - l[l.length - 1]
          let absdiff = abs(diff)
          if (absdiff === 0) {
            l.pop()
            break
          }
          l.push(absdiff)
        }
        l.reverse()
        let min = 0
        let newl = []
        l.forEach((e) => {
          if (e > min) {
            min = e
            newl.push(e)
          }
        })
        fractions = [
          fraction(0, 1),
          fraction(1, 2),
          fraction(1, 3)
        ]
        for (let i = 3; i < newl.length; i++) {
          let nennerId = newl[i] - newl[i - 1]
          let nennerIndex = newl.indexOf(nennerId)
          let f1 = fractions[nennerIndex]
          let f2 = fractions[i - 1]
          fractions.push(fraction(f1.n + f2.n, newl[i]))
        }
      }
    }
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" ref="input" default={442}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} />
              </th>
            </tr>
            <tr>
              <th>String</th>
              <th>
                <select onChange={(event) => {
                  let tone = event.target.value
                  this.setState({ tone })
                }}>
                  {magic.map((v, i) => {
                    return (
                      <option key={i} value={i}>{v}</option>
                    )
                  })}
                </select>
              </th>
              <th>Octave</th>
              <th>
                <input type="number" name="quantity"
                  min="0" max="8" value={this.state.octave}
                  style={{width: '3em'}}
                  onChange={(event) => {
                    let octave = parseInt(event.target.value)
                    this.setState({ octave })
                  }}/>
              </th>
              <th>Frequency</th>
              <th>
                <PrecNumber value={freq} precision={2} />
              </th>
            </tr>
            <tr>
              <th>Two Partials</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" ref="input"
                  onChange={(p1) => {
                    this.setState({ p1 })
                  }} />
              </th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" ref="input"
                  onChange={(p2) => {
                    this.setState({ p2 })
                  }} />
              </th>
            </tr>
            {error ? (
              <tr>
                <th>Error</th>
                <th style={{color: 'red'}}>{error}</th>
              </tr>
            ) : null}
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th>Node / Partial</th>
              <th>Frequency</th>
              <th>Note</th>
              <th />
            </tr>
            {fractions.map((f, i) => {
              let freqC0 = this.state.concertPitch / pow(2, (1 / 12) * 57)
              let cents = ratioToCents((freq * f.d) / freqC0)
              return (
                <tr key={i}>
                  <th>
                    {f.n} / {f.d}
                  </th>
                  <th>
                    <PrecNumber value={freq * f.d} />
                  </th>
                  <th>
                    <NoteDisplay cents={cents} />
                  </th>
                  <th>
                    <NoteImage cents={cents} />
                  </th>
                  <th>
                    <CompactFrequencyPlayer freq={freq * f.d} />
                  </th>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
