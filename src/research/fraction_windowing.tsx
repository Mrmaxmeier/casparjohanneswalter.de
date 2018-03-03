import * as React from 'react'

import { MathInput, PrecNumber } from './components'
import { intelligenterMediant, ratioToCents } from './converters'
import { Fraction } from './math'

interface State extends React.ComponentState {
  input?: number,
  ma?: number,
  mb?: number,
  precision: number
}

interface ClassColors { normal: string, good: string, best: string, final: string }
type Classification = keyof ClassColors
const classColors: ClassColors = {
  normal: 'white',
  good: '#b1f7b1',
  best: 'orange',
  final: 'orange'
}

export class FractionWindowing extends React.PureComponent<{}, State> {
  private input?: MathInput;
  private ma?: MathInput;
  private mb?: MathInput;

  constructor (props: {}) {
    super(props)
    this.state = {
      input: undefined,
      ma: undefined,
      mb: undefined,
      precision: 5
    }
  }

  calcData () {
    if (this.state.input === undefined) { return null }
    let input = Fraction.into(this.state.input)
    let output = intelligenterMediant(input, this.state.precision)
    let smallestDiff = null
    let smaller = [false]
    let classifications: Classification[] = []
    for (let i = 0; i < output.length; i++) {
      let e = output[i]
      let currentDiff = Math.abs(e.value - input.value)
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
        if (Math.abs(a.value - input.value) < Math.abs(b.value - input.value)) {
          classifications[i - 1] = 'best'
        } else {
          classifications[i - 2] = 'best'
        }
      }
      c = s
    })
    classifications[classifications.length - 1] = 'best'
    return { input, classifications, output }
  }

  render () {
    let modeFraction = !(this.state.ma && this.state.mb)
    let checkMaMb = (ma?: number, mb?: number) => {
      if (ma && mb) {
        let input = Math.log2(ma / mb)
        if (this.input)
          this.input.setValue(input, false)
        this.setState({ input })
      }
    }
    const data = this.calcData()
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Number or Fraction</th>
              <th>
                <MathInput
                  wide ref={(e) => { if(e) this.input = e }}
                  onChange={(input) => {
                    this.setState({ input })
                    if (this.ma)
                      this.ma.setValue('', true)
                    if (this.mb)
                      this.mb.setValue('', true)
                  }} />
              </th>
              <th>
                {data ? (
                  <PrecNumber value={data.input.numerator / data.input.denominator} precision={this.state.precision} />
                ) : null}
              </th>
              {modeFraction && this.state.input && data ? (
              <th>
                Cents: <PrecNumber value={ratioToCents(data.input.value)} />
              </th>
              ) : null}
            </tr>
            <tr>
              <th>Alt (log(a / b) / log(2))</th>
              <th>
                <MathInput wide onChange={(v) => {
                  this.setState({ ma: v })
                  checkMaMb(v, this.state.mb)
                }} ref={(e) => { if (e) this.ma = e }} />
              </th>
              <th>
                <MathInput wide onChange={(v) => {
                  this.setState({ mb: v })
                  checkMaMb(this.state.ma, v)
                }} ref={(e) => { if (e) this.mb = e }} />
              </th>
              {!modeFraction && this.state.ma && this.state.mb ? (
              <th>
                Cents: <PrecNumber value={ratioToCents(this.state.ma / this.state.mb)} />
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
            {data ? (
              data.output.map((f, i) => {
                let diff = (f.value - data.input.value) / data.input.value
                let color = classColors[data.classifications[i]]
                let cents = modeFraction ? ratioToCents(f.value) : f.value * 1200
                let inputCents
                if (modeFraction) {
                  inputCents = ratioToCents(data.input.value)
                } else if (this.state.ma && this.state.mb) {
                  inputCents = ratioToCents(this.state.ma / this.state.mb)
                } else { return null }
                return (
                  <tr key={i} style={{ background: color }}>
                    <th>#{i + 1}</th>
                    <th>{f.numerator} / {f.denominator}</th>
                    <th><PrecNumber value={f.value} precision={this.state.precision} /></th>
                    <th><PrecNumber value={diff * 100} precision={this.state.precision} />%</th>
                    <th><PrecNumber value={cents} precision={this.state.precision} /></th>
                    <th><PrecNumber value={inputCents - cents} precision={this.state.precision} /></th>
                  </tr>
                )
              })
            ) : null
            }
          </tbody>
        </table>
      </div>
    )
  }
}
