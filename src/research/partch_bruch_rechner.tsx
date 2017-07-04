import * as React from 'react'

import { RatioInput } from './kithara_components'
import { Fraction } from './math'

import { clone } from 'lodash'

let highlighted = [[1, 1], [81, 80], [33, 32], [21, 20], [16, 15], [12, 11], [11, 10], [10, 9], [9, 8], [8, 7], [7, 6], [32, 27], [6, 5], [11, 9], [5, 4], [14, 11], [9, 7], [21, 16], [4, 3], [27, 20], [11, 8], [7, 5], [10, 7], [16, 11], [40, 27], [3, 2], [32, 21], [14, 9], [11, 7], [8, 5], [18, 11], [5, 3], [27, 16], [12, 7], [7, 4], [16, 9], [9, 5], [20, 11], [11, 6], [15, 8], [40, 21], [64, 33], [160, 81], [2, 1]]

interface State {
  main: Fraction,
  scnd: Fraction,
  ops: Fraction[]
}

export class Rechner extends React.PureComponent<{}, State> {
  constructor (props: {}) {
    super(props)
    this.state = {
      main: new Fraction(1, 1),
      scnd: new Fraction(1, 1),
      ops: [
        [12, 11], [11, 10], [10, 9], [9, 8],
        [8, 7], [7, 6], [6, 5], [11, 9],
        [5, 4], [14, 11], [9, 7], [4, 3],
        [11, 8], [7, 5], [10, 7]
      ].map((d) => new Fraction(d[0], d[1]))
    }
  }

  outList (data: (Fraction | null)[]) {
    let isHighlighted = (e: Fraction) => highlighted.reduce((a, d) => a || (d[0] === e.numerator && d[1] === e.denominator), false)
    return (
      <div>
        <table>
          <tbody>
            <tr>
              {data.map((d, i) => {
                if (d && d.numerator !== null)
                  return <RatioInput key={i} data={d.numerator} isUpper highlighted={isHighlighted(d)} disabled />
              })}
            </tr>
            <tr>
              {data.map((d, i) => {
                if (d && d.denominator !== null)
                  return <RatioInput key={i} data={d.denominator} isUpper={false} highlighted={isHighlighted(d)} disabled />
              })}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  render () {
    let clamp = (frac: Fraction) => {
      let steps = 0
      while (frac.value > 2.0) {
        steps++
        frac.denominator *= 2
        if (steps > 99) {
          return null
        }
      }
      while (frac.value < 1.0) {
        steps++
        frac.numerator *= 2
        if (steps > 99) {
          return null
        }
      }
      return frac.reduce()
    }

    let sanetizeFrac = (frac: Fraction) => {
      if (isNaN(frac.numerator) || isNaN(frac.denominator)) {
        return null
      }
      return frac
    }
  
    return (
      <div>
        <table>
          <tbody>
            <tr><RatioInput data={this.state.main.numerator} isUpper changeCB={(v) => {
              this.setState({ main: new Fraction(v, this.state.main.denominator) })
            }} /></tr>
            <tr><RatioInput data={this.state.main.denominator} changeCB={(v) => {
              this.setState({ main: new Fraction(this.state.main.numerator, v) })
            }} /></tr>
          </tbody>
        </table>

        <table>
          <tbody>
            <tr>
              {this.state.ops.map((d, i) => {
                return <RatioInput key={i} data={d.numerator} isUpper changeCB={(v) => {
                  let ops = clone(this.state.ops)
                  ops[i].denominator = v
                  this.setState({ ops })
                }} />
              })}
            </tr>
            <tr>
              {this.state.ops.map((d, i) => {
                return <RatioInput key={i} data={d.denominator} isUpper={false} changeCB={(v) => {
                  let ops = clone(this.state.ops)
                  ops[i].denominator = v
                  this.setState({ ops })
                }} />
              })}
            </tr>
          </tbody>
        </table>

        {this.outList(this.state.ops.map((frac) => {
          let main = sanetizeFrac(this.state.main)
          if (!main) {
            return null
          }
          return clamp(frac.mul(main))
        }))}
        {this.outList(this.state.ops.map((frac) => {
          let main = sanetizeFrac(this.state.main)
          if (!main) {
            return null
          }
          return clamp(main.div(frac))
        }))}

        <table>
          <tbody>
            <tr><RatioInput data={this.state.scnd.numerator} isUpper changeCB={(v) => {
              this.setState({ scnd: new Fraction(v, this.state.scnd.denominator) })
            }} /></tr>
            <tr><RatioInput data={this.state.scnd.denominator} changeCB={(v) => {
              this.setState({ scnd: new Fraction(this.state.scnd.numerator, v) })
            }} /></tr>
          </tbody>
        </table>

        {this.outList(this.state.ops.map((frac) => {
          let scnd = sanetizeFrac(this.state.scnd)
          if (!scnd) {
            return null
          }
          return clamp(frac.mul(scnd))
        }))}
        {this.outList(this.state.ops.map((frac) => {
          let scnd = sanetizeFrac(this.state.scnd)
          if (!scnd) {
            return null
          }
          return clamp(scnd.div(frac))
        }))}
      </div>
    )
  }
}
