import React, {Component} from 'react'
import { fraction, abs, log } from 'mathjs'

import { RequiresJS, MathInput, PrecNumber } from './components.jsx'
import { intelligenterMediant, ratioToCents } from './converters.js'

export class FractionWindowing extends Component {
  constructor (props) {
    super(props)
    this.state = {
      input: null,
      ma: null,
      mb: null,
      precision: 5
    }
  }

  render () {
    console.log(this.state.input)
    let input = fraction(this.state.input)
    let output = intelligenterMediant(input, this.state.precision)
    let smallestDiff = null
    let smaller = [false]
    let classifications = []
    for (let i = 0; i < output.length; i++) {
      let e = output[i]
      let currentDiff = abs(e - input)
      if (smallestDiff === null || currentDiff < smallestDiff) {
        smallestDiff = currentDiff
        classifications.push('good')
      } else {
        classifications.push('normal')
      }
      if (i > 0) {
        smaller.push(output[i] > output[i - 1])
      }
    }
    let c = smaller[0]
    smaller.forEach((s, i) => {
      if (c !== s && i > 1) {
        let a = output[i - 1]
        let b = output[i - 2]
        if (abs(a - input) < abs(b - input)) {
          classifications[i - 1] = 'best'
        } else {
          classifications[i - 2] = 'best'
        }
      }
      c = s
    })
    classifications[classifications.length - 1] = 'best'
    let checkMaMb = (ma, mb) => {
      if (ma && mb) {
        let input = (log(ma / mb) / log(2))
        this.refs.input.setValue(input, false)
        this.setState({ input })
      }
    }
    let modeFraction = !(this.state.ma && this.state.mb)
    return (
      <div>
        <RequiresJS />
        <table>
          <tbody>
            <tr>
              <th>Number or Fraction</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" ref="input"
                  onChange={(input) => {
                    this.setState({ input })
                    this.refs.ma.setValue('', true)
                    this.refs.mb.setValue('', true)
                  }} />
              </th>
              <th>
                <PrecNumber value={input.n / input.d} precision={this.state.precision} />
              </th>
              {modeFraction && this.state.input ? (
              <th>
                Cents: <PrecNumber value={ratioToCents(input)} />
              </th>
              ) : null}
            </tr>
            <tr>
              <th>Alt (log(a / b) / log(2))</th>
              <th>
                <MathInput wide asKind="mathjs-ignoreerror" onChange={(v) => {
                  this.setState({ ma: v })
                  checkMaMb(v, this.state.mb)
                }} ref='ma' />
              </th>
              <th>
                <MathInput wide asKind="mathjs-ignoreerror" onChange={(v) => {
                  this.setState({ mb: v })
                  checkMaMb(this.state.ma, v)
                }} ref='mb' />
              </th>
              {!modeFraction ? (
              <th>
                Cents: <PrecNumber value={ratioToCents(fraction(this.state.ma, this.state.mb))} />
              </th>
              ) : null}
            </tr>
            <tr>
              <th>
                Precision
              </th>
              <th>
                <input type="number" name="quantity"
                  min="2" max="16" value={this.state.precision}
                  style={{width: '3em'}}
                  onChange={(event) => {
                    let precision = parseInt(event.target.value)
                    this.setState({ precision })
                  }}/> digits
              </th>
            </tr>
            <tr>
              <th>Mode</th>
              <th>{modeFraction ? 'Fraction' : 'Temperament'}</th>
            </tr>
          </tbody>
        </table>
        <table style={{lineHeight: '0.3em'}}>
          <tbody>
            <tr style={{lineHeight: '1em'}}>
              <th />
              <th>{modeFraction ? 'Fraction' : <span>Steps /<br />Temperament</span>}</th>
              <th>Value</th>
              <th>Diff %</th>
              <th>Cents</th>
              <th>Cent Diff</th>
            </tr>
            {output.map((f, i) => {
              let diff = (f - input) / input
              let color = {
                normal: 'white',
                good: '#b1f7b1',
                best: 'orange',
                final: 'orange'
              }[classifications[i]]
              let cents = modeFraction ? ratioToCents(f) : f * 1200
              let inputCents = modeFraction ? ratioToCents(input) : ratioToCents(fraction(this.state.ma, this.state.mb))
              return (
                <tr key={i} style={{ background: color }}>
                  <th>#{i + 1}</th>
                  <th>{f.n} / {f.d}</th>
                  <th><PrecNumber value={f.n / f.d} precision={this.state.precision} /></th>
                  <th><PrecNumber value={diff * 100} precision={this.state.precision} />%</th>
                  <th><PrecNumber value={cents} precision={this.state.precision} /></th>
                  <th><PrecNumber value={inputCents - cents} precision={this.state.precision} /></th>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
