import * as React from 'react'
import { pow, gcd, max, min, abs } from 'mathjs'

import {
  MathInput, PrecNumber, NoteImage, PlayAllButton,
  NoteDisplay, CompactFrequencyPlayer, StringValueVisualisation
} from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import { IAudioProvider } from './audio'
import { ratioToCents } from './converters'
import { Fraction } from './math'


const magic = [
  'c', 'c#',
  'd',
  'e♭', 'e',
  'f', 'f#',
  'g',
  'a♭', 'a',
  'b♭', 'b'
]

interface Data { octave: number, tone: number, p1?: number, p2?: number }

interface State {
  concertPitch: number,
  data1: Data,
  data2: Data,
}

export class PianoMultiphonicCalculatorII extends React.PureComponent<{}, State> {
  constructor (props: {}) {
    super(props)
    this.state = {
      concertPitch: 442,
      data1: {
        octave: 1,
        tone: 0,
        p1: undefined,
        p2: undefined
      },
      data2: {
        octave: 1,
        tone: 0,
        p1: undefined,
        p2: undefined
      }
    }
  }

  compute (concertPitch: number, data: Data) {
    let a = (concertPitch / Math.pow(2, 3 / 4)) / 16
    let b = a * Math.pow(2, data.tone / 12)
    let freq = b * Math.pow(2, data.octave)
    let p1 = data.p1
    let p2 = data.p2
    let error = null
    let result = null
    let fractions: Fraction[] = []
    if (p1 && p2) {
      if (gcd(p1, p2) !== 1) {
        error = 'Greatest common divisor: ' + gcd(p1, p2)
      } else {
        let l = [
          Math.max(p1, p2),
          Math.min(p1, p2)
        ]
        while (true) {
          let diff = l[l.length - 2] - l[l.length - 1]
          let absdiff = Math.abs(diff)
          if (absdiff === 0) {
            l.pop()
            break
          }
          l.push(absdiff)
        }
        l.reverse()
        let min_ = 0
        let newl: number[] = []
        l.forEach((e) => {
          if (e > min_) {
            min_ = e
            newl.push(e)
          }
        })
        fractions = [
          new Fraction(0, 1),
          new Fraction(1, 2),
          new Fraction(1, 3)
        ]
        for (let i = 3; i < newl.length; i++) {
          let nennerId = newl[i] - newl[i - 1]
          let nennerIndex = newl.indexOf(nennerId)
          let f1 = fractions[nennerIndex]
          let f2 = fractions[i - 1]
          fractions.push(new Fraction(f1.numerator + f2.numerator, newl[i]))
        }
        result = fractions[fractions.length - 1].value
      }
    }

    return { freq, error, result, fractions }
  }

  setData (row: number, values: Partial<Data>) {
    let old = row < 1 ? this.state.data1 : this.state.data2
    let copy = Object.assign({}, old)
    Object.assign(copy, values)
    if (row < 1) {
      this.setState({ data1: copy })
    } else {
      this.setState({ data2: copy })
    }
  }

  renderData (freq: number, fractions: Fraction[]) {
    let players: CompactFrequencyPlayer[] = []
    return (
      <table>
        <tbody>
          <tr>
            <th>Node /<br /> Partial</th>
            <th>Frequency</th>
            <th>Note</th>
            <th />
            <th>
              <PlayAllButton disabled={fractions.length < 1} playerRefs={players} />
            </th>
          </tr>
          {fractions.map((f, i) => {
            let freqC0 = this.state.concertPitch / Math.pow(2, (1 / 12) * 57)
            let cents = ratioToCents((freq * f.denominator) / freqC0)
            return (
              <tr key={i}>
                <th>
                  {f.numerator} / {f.denominator}
                </th>
                <th>
                  <PrecNumber value={freq * f.denominator} />
                </th>
                <th>
                  <NoteDisplay cents={cents} />
                </th>
                <th style={{padding: 0, margin: 0}}>
                  <NoteImage cents={cents} />
                </th>
                <th>
                  <CompactFrequencyPlayer freq={freq * f.denominator} ref={(el) => { if (el) players.push(el) }} />
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
    let visOptions = {
      ...( a.result ? { red: a.result } : {} ),
      ...( b.result ? { blue: b.result } : {} )
    }
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Concert Pitch</th>
              <th>
                <MathInput default={442}
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
                <select onChange={(event) => this.setData(0, { tone: parseInt(event.target.value) })}>
                  {toneOptions}
                </select>
              </th>
              <th>
                <select onChange={(event) => this.setData(1, { tone: parseInt(event.target.value) })}>
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
                  onChange={(p1) => this.setData(0, { p1 })} />
              </th>
              <th>
                <MathInput
                  onChange={(p1) => this.setData(1, { p1 })} />
              </th>
            </tr>
            <tr>
              <th>Partial 2</th>
              <th>
                <MathInput
                  onChange={(p2) => this.setData(0, { p2 })} />
              </th>
              <th>
                <MathInput
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
          {this.renderData(a.freq, a.fractions)}
          {this.renderData(b.freq, b.fractions)}
        </div>
        {a.result || b.result ? (
          <StringValueVisualisation values={visOptions} />
        ) : null}
      </div>
    )
  }
}
