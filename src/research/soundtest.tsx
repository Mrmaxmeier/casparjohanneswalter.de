import * as React from 'react'

import {MathInput, FreqPlayer, PrecNumber} from './components'

interface State {
  freq: number,
  octave: number,
}

export class SoundTest extends React.PureComponent<{}, State> {
  private _nodes: FreqPlayer[]
  constructor (props: {}) {
    super(props)
    this.state = {
      freq: 440,
      octave: 2
    }
    this._nodes = []
  }

  defaultVolume(i: number, freq?: number) {
    return 0.5
  }

  render () {
    let refFreq = this.state.freq
    let octave = this.state.octave || 2
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Freq</th>
              <th>
                <MathInput default={440} wide
                  onChange={(freq) => {
                    this._nodes.forEach((node, i: number) => {
                      let volume = this.defaultVolume(i, freq)
                      node.setState({ volume })
                    })
                    this.setState({freq})
                  }} />
              </th>
            </tr>
            <tr>
              <th>Sound color</th>
              <th>
                <PrecNumber precision={3} value={1 / Math.sqrt(refFreq / 16)} />
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
              {new Array(32).fill(null).map((_: null, i: number) => {
                let freq = Math.pow(octave, Math.log2(i + 1)) * refFreq
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
