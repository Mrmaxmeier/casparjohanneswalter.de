import React, {Component} from 'react'
import math from 'mathjs'

import { RequiresJS, MathInput, PrecNumber } from './components.jsx'
import { intelligenterMediant } from './converters.js'

export class FractionWindowing extends Component {
  constructor (props) {
    super(props)
    this.state = {
      input: {
        value: null,
        error: null
      },
      minput: {
        a: null,
        b: null
      },
      precision: 5
    }
  }

  render () {
    let input = this.state.input.value
    let error = this.state.input.error
    let output = []
    let classifications = []
    if (input) {
      input = math.fraction(input)
      output = intelligenterMediant(input, this.state.precision)
      let smallestDiff = null
      let smaller = []
      for (let i = 0; i < output.length; i++) {
        let e = output[i]
        let currentDiff = math.abs(e - input)
        if (smallestDiff === null || currentDiff < smallestDiff) {
          smallestDiff = currentDiff
          classifications.push('good')
          smaller.push(true)
        } else {
          classifications.push('normal')
          smaller.push(false)
        }
      }
      let c = smaller[0]
      smaller.forEach((s, i) => {
        if (c !== s && i > 1) {
          let a = output[i - 1]
          let b = output[i - 2]
          if (math.abs(a - input) < math.abs(b - input)) {
            classifications[i - 1] = 'best'
          } else {
            classifications[i - 2] = 'best'
          }
        }
        c = s
      })
      classifications[classifications.length - 1] = 'best'
    }
    let checkMaMb = (ma, mb) => {
      if (ma && mb) {
        let val = (math.log(ma / mb) / math.log(2))
        this.refs.input.setValue(val, false)
        let input = {value: val, error: null}
        this.setState({ input })
      }
    }
    return (
      <div>
        <RequiresJS />
        <table>
          <tbody>
            <tr>
              <th>Number or Fraction</th>
              <th>
                <MathInput
                  wide asKind="mathjs" ref="input"
                  onChange={(input) => {
                    this.setState({ input })
                    this.refs.ma.setValue('', true)
                    this.refs.mb.setValue('', true)
                  }} />
              </th>
              <th>
                {input ? <PrecNumber value={input.n / input.d} precision={this.state.precision} /> : null}
              </th>
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
            {error ? (
              <tr style={{color: 'red'}}>
                <th>Error</th>
                <th>{error.toString()}</th>
              </tr>
            ) : null}
          </tbody>
        </table>
        <table style={{lineHeight: '0.3em'}}>
          <tbody>
            {output.map((f, i) => {
              let diff = (f - input) / input
              let color = {
                normal: 'white',
                good: '#b1f7b1',
                best: 'orange',
                final: 'orange'
              }[classifications[i]]
              return (
                <tr key={i} style={{ background: color }}>
                  <th>#{i + 1}</th>
                  <th>{f.n} / {f.d}</th>
                  <th><PrecNumber value={diff * 100} precision={this.state.precision} />%</th>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
