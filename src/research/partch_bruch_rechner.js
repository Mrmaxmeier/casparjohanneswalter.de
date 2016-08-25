
const React = require('react')

import { RatioInput } from './kithara_components'
import {
  div,
  mul,
  reduce
} from './kithara_math'

let clone = obj => JSON.parse(JSON.stringify(obj))
let highlighted = [[1, 1], [81, 80], [33, 32], [21, 20], [16, 15], [12, 11], [11, 10], [10, 9], [9, 8], [8, 7], [7, 6], [32, 27], [6, 5], [11, 9], [5, 4], [14, 11], [9, 7], [21, 16], [4, 3], [27, 20], [11, 8], [7, 5], [10, 7], [16, 11], [40, 27], [3, 2], [32, 21], [14, 9], [11, 7], [8, 5], [18, 11], [5, 3], [27, 16], [12, 7], [7, 4], [16, 9], [9, 5], [20, 11], [11, 6], [15, 8], [40, 21], [64, 33], [160, 81], [2, 1]]

export class Rechner extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      main: [1, 1],
      scnd: [1, 1],
      ops: [[12, 11], [11, 10], [10, 9], [9, 8], [8, 7], [7, 6], [6, 5], [11, 9], [5, 4], [14, 11], [9, 7], [4, 3], [11, 8], [7, 5], [10, 7]]
    }
  }
  outList (data) {
    let isHighlighted = (e) => highlighted.reduce((a, d) => a || (d[0] === e[0] && d[1] === e[1]), false)
    return (
      <div>
        <table>
          <tbody>
            <tr>
              {data.map((d, i) => {
                let data = !d ? null : d[0]
                return <RatioInput key={i} data={data} isUpper highlighted={isHighlighted(d)} disabled />
              })}
            </tr>
            <tr>
              {data.map((d, i) => {
                let data = !d ? null : d[1]
                return <RatioInput key={i} data={data} isUpper={false} highlighted={isHighlighted(d)} disabled />
              })}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  render () {
    let clamp = (frac) => {
      let steps = 0
      while (frac[0] / frac[1] > 2.0) {
        steps++
        frac[1] *= 2
        if (steps > 99) {
          return [null, null]
        }
      }
      while (frac[0] / frac[1] < 1.0) {
        steps++
        frac[0] *= 2
        if (steps > 99) {
          return [null, null]
        }
      }
      return reduce(frac)
    }
    let sanetizeFrac = (frac) => {
      let a = parseInt(frac[0])
      let b = parseInt(frac[1])
      if (isNaN(a) || isNaN(b)) {
        return null
      }
      return [a, b]
    }
    return (
      <div>
        <table>
          <tbody>
            <tr><RatioInput data={this.state.main[0]} isUpper changeCB={(v) => {
              this.setState({main: [v, this.state.main[1]]})
            }} /></tr>
            <tr><RatioInput data={this.state.main[1]} changeCB={(v) => {
              this.setState({main: [this.state.main[0], v]})
            }} /></tr>
          </tbody>
        </table>

        <table>
          <tbody>
            <tr>
              {this.state.ops.map((d, i) => {
                return <RatioInput key={i} data={d[0]} isUpper changeCB={(v) => {
                  let ops = clone(this.state.ops)
                  ops[i][0] = v
                  this.setState({ ops })
                }} />
              })}
            </tr>
            <tr>
              {this.state.ops.map((d, i) => {
                return <RatioInput key={i} data={d[1]} isUpper={false} changeCB={(v) => {
                  let ops = clone(this.state.ops)
                  ops[i][1] = v
                  this.setState({ ops })
                }} />
              })}
            </tr>
          </tbody>
        </table>

        {this.outList(this.state.ops.map((frac) => {
          let main = sanetizeFrac(this.state.main)
          if (!main) {
            return
          }
          return clamp(mul(frac, main))
        }))}
        {this.outList(this.state.ops.map((frac) => {
          let main = sanetizeFrac(this.state.main)
          if (!main) {
            return
          }
          return clamp(div(main, frac))
        }))}

        <table>
          <tbody>
            <tr><RatioInput data={this.state.scnd[0]} isUpper changeCB={(v) => {
              this.setState({scnd: [v, this.state.scnd[1]]})
            }} /></tr>
            <tr><RatioInput data={this.state.scnd[1]} changeCB={(v) => {
              this.setState({scnd: [this.state.scnd[0], v]})
            }} /></tr>
          </tbody>
        </table>

        {this.outList(this.state.ops.map((frac) => {
          let scnd = sanetizeFrac(this.state.scnd)
          if (!scnd) {
            return
          }
          return clamp(mul(frac, scnd))
        }))}
        {this.outList(this.state.ops.map((frac) => {
          let scnd = sanetizeFrac(this.state.scnd)
          if (!scnd) {
            return
          }
          return clamp(div(scnd, frac))
        }))}
      </div>
    )
  }
}
