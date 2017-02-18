import React, {PureComponent} from 'react'
import { pow, gcd, max, min, abs, fraction } from 'mathjs'

import {
  MathInput, PrecNumber, NoteImage,
  NoteDisplay, CompactFrequencyPlayer, StringValueVisualisation
} from './components.jsx'
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
      data1: {
        octave: 1,
        tone: 0,
        p1: null,
        p2: null
      },
      data2: {
        octave: 1,
        tone: 0,
        p1: null,
        p2: null
      }
    }
  }

  compute (concertPitch, data) {
    let a = (concertPitch / pow(2, 3 / 4)) / 16
    let b = a * pow(2, data.tone / 12)
    let freq = b * pow(2, data.octave)
    let p1 = data.p1
    let p2 = data.p2
    let error = null
    let result = null
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
        let min_ = 0
        let newl = []
        l.forEach((e) => {
          if (e > min_) {
            min_ = e
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
        result = fractions[fractions.length - 1].valueOf()
      }
    }

    return { freq, error, result, fractions }
  }

  setData (row, values) {
    let old = row < 1 ? this.state.data1 : this.state.data2
    let copy = Object.assign({}, old)
    Object.assign(copy, values)
    if (row < 1) {
      this.setState({ data1: copy })
    } else {
      this.setState({ data2: copy })
    }
  }

  renderData (data) {
    let fractions = data.fractions
    let freq = data.freq
    return (
      <table>
        <tbody>
          <tr>
            <th>Node /<br /> Partial</th>
            <th>Frequency</th>
            <th>Note</th>
            <th />
            <th>
              <button disabled={fractions.length < 1} onClick={() => {}}>
                Play All
              </button>
            </th>
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
                <th style={{padding: 0, margin: 0}}>
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
    )
  }

  render () {
    let a = this.compute(this.state.concertPitch, this.state.data1)
    let b = this.compute(this.state.concertPitch, this.state.data2)
    let toneOptions = magic.map((v, i) => <option key={i} value={i}>{v}</option>)
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Concert Pitch blah</th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror" default={442}
                  onChange={(concertPitch) => this.setState({ concertPitch })} />
              </th>
              <th />
            </tr>
            <tr>
              <th />
              <th style={{color: 'red'}}>One</th>
              <th style={{color: 'blue'}}>Two</th>
            </tr>
            <tr>
              <th>String</th>
              <th>
                <select onChange={(event) => this.setData(0, { tone: event.target.value })}>
                  {toneOptions}
                </select>
              </th>
              <th>
                <select onChange={(event) => this.setData(1, { tone: event.target.value })}>
                  {toneOptions}
                </select>
              </th>
            </tr>
            <tr>
              <th>Octave</th>
              <th>
                <input type="number" name="quantity"
                  min="0" max="8" value={this.state.data1.octave}
                  style={{width: '3em'}}
                  onChange={(event) => this.setData(0, { octave: parseInt(event.target.value) })} />
              </th>
              <th>
                <input type="number" name="quantity"
                  min="0" max="8" value={this.state.data2.octave}
                  style={{width: '3em'}}
                  onChange={(event) => this.setData(1, { octave: parseInt(event.target.value) })} />
              </th>
            </tr>
            <tr>
              <th>Frequency</th>
              <th>
                <PrecNumber value={a.freq} precision={2} />
              </th>
              <th>
                <PrecNumber value={b.freq} precision={2} />
              </th>
            </tr>
            <tr>
              <th>Partial 1</th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(p1) => this.setData(0, { p1 })} />
              </th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(p1) => this.setData(1, { p1 })} />
              </th>
            </tr>
            <tr>
              <th>Partial 2</th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(p2) => this.setData(0, { p2 })} />
              </th>
              <th>
                <MathInput
                  asKind="mathjs-ignoreerror"
                  onChange={(p2) => this.setData(1, { p2 })} />
              </th>
            </tr>
            {(a.error || b.error) ? (
              <tr>
                <th>Error</th>
                {a.error ? <th style={{color: 'red'}}>{a.error}</th> : <th />}
                {b.error ? <th style={{color: 'red'}}>{b.error}</th> : <th />}
              </tr>
            ) : null}
          </tbody>
        </table>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {this.renderData(a)}
          {this.renderData(b)}
        </div>
        {a.result || b.result ? (
          <StringValueVisualisation values={{ 'red': a.result, 'blue': b.result }} />
        ) : null}
      </div>
    )
  }
}
