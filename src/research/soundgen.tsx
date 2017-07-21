import * as React from 'react'
import { max, sqrt, log } from 'mathjs'

import {MathInput, FreqPlayer, PrecNumber} from './components'

interface State {
  octave: number,
  freq: number,
}

export class SoundGen extends React.PureComponent<{}, State> {
  private _nodes: FreqPlayer[]
  constructor (props: {}) {
    super(props)
    this.state = {
      octave: 2,
      freq: 440,
    }
    this._nodes = new Array(32)
  }

  defaultVolume (index: number, freq?: number) {
    let refFreq = freq || this.state.freq
    refFreq = max(refFreq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return Math.pow(sC, index)
  }

  render () {
    let refFreq = this.state.freq
    let octave = this.state.octave
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Octave</th>
              <th>
                <MathInput default={2} wide
                  onChange={(octave) => { this.setState({ octave }) }} />
              </th>
            </tr>
            <tr>
              <th>Freq</th>
              <th>
                <MathInput default={440} wide
                  onChange={(freq) => {
                    this._nodes.forEach((node, i) => {
                      let volume = this.defaultVolume(i, freq)
                      node.setState({ volume })
                    })
                    this.setState({ freq })
                  }} />
              </th>
            </tr>
            <tr>
              <th>Sound color</th>
              <th>
                <PrecNumber precision={3} value={1 / sqrt(refFreq / 16)} />
              </th>
            </tr>
            <tr>
              <th>
                <button onClick={() => {
                  this._nodes.forEach((node) => node.setPlaying(true))
                }}>Play All</button>
              </th>
              <th>
                <button onClick={() => {
                  this._nodes.forEach((node) => node.setPlaying(false))
                }}>Stop All</button>
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
              {new Array(32).fill(null).map((_, i) => {
                let freq = Math.pow(octave, Math.log(i + 1)) * refFreq
                return <FreqPlayer showTypePicker={false}
                          inTable freq={freq} key={i}
                          defaultVolume={this.defaultVolume(i)}
                          ref={(v) => { if (v) this._nodes[i] = v }} />
              })}
          </tbody>
        </table>
      </div>
    )
  }
}
