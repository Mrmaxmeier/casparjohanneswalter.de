import * as React from 'react'
import { abs } from 'mathjs'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import { concertPitchToC0, ratioToCents } from './converters'
import { range } from 'lodash'

let diamond = [
                      [[11, 4]],
                  [[9, 4], [11, 5]],
              [[7, 4], [9, 5], [11, 6]],
          [[3, 2], [7, 5], [3, 2], [11, 7]],
      [[5, 4], [6, 5], [7, 6], [9, 7], [11, 9]],
  [[1, 1], [1, 1], [1, 1], [1, 1], [1, 1], [1, 1]],
      [[4, 5], [5, 6], [6, 7], [7, 9], [9, 11]],
          [[2, 3], [5, 7], [2, 3], [7, 11]],
              [[4, 7], [5, 9], [6, 11]],
                  [[4, 9], [5, 11]],
                      [[4, 11]]
]

interface State {
  concertPitch: number,
  pitch11: number
}

export class TonalityDiamond extends React.PureComponent<{}, State> {
  constructor (props: {}) {
    super(props)
    this.state = {
      concertPitch: 440,
      pitch11: 440 / 9 * 8
    }
  }

  render () {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  wide
                  default={440}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch })
                  }} />
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} />
              </th>
              <th>
                <NoteImage cents={cents} />
              </th>
              <th>
                <NoteDisplay cents={cents} />
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            {diamond.map((row, rowi) => {
              return (
                <tr key={rowi}>
                  {range(abs(5 - rowi)).map((_, i) => {
                    return (
                      <th key={i} />
                    )
                  })}
                  {range(row.length * 2).map((n) => {
                    let i = Math.trunc(n / 2)
                    let elem = row[i]
                    let thStyle = {maxWidth: '4.5em'}
                    if (n % 2 === 0) {
                      return (
                        <th key={n} style={thStyle}>
                          <div style={{lineHeight: '0.7em'}}>
                            <span>{elem[0]}</span>
                            <br />
                            <span>－</span>
                            <br />
                            <span>{elem[1]}</span>
                          </div>
                        </th>
                      )
                    } else {
                      return (
                        <th key={n} style={thStyle}>
                          <CompactFrequencyPlayer freq={this.state.pitch11 * (elem[0] / elem[1])}
                            buttonStyle={{position: 'relative', left: '-30px'}} />
                        </th>
                      )
                    }
                  })}
                  {range(abs(5 - rowi)).map((_, i) => {
                    return (
                      <th key={i} />
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
