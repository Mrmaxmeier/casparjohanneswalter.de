import React, {Component} from 'react'
import { max, sqrt, log } from 'mathjs'

import {RequiresJS, MathInput, FreqPlayer, PrecNumber} from './components.jsx'

export class SoundGen extends Component {
  constructor (props) {
    super(props)
    this.state = {
      octave: {
        value: 2,
        error: null
      },
      freq: {
        value: 440,
        error: null
      }
    }
    this._nodes = Array(32).fill()
  }
  defaultVolume (index, freq) {
    let refFreq = freq || this.state.freq.value || 440
    refFreq = max(refFreq, 32)
    let sC = 1 / sqrt(refFreq / 16)
    return Math.pow(sC, index)
  }
  render () {
    let error = this.state.octave.error || this.state.freq.error
    let refFreq = this.state.freq.value || 440
    let octave = this.state.octave.value || 2
    return (
      <div>
        <RequiresJS />
        <table>
          <tbody>
            <tr>
              <th>Octave</th>
              <th>
                <MathInput default={2}
                  wide asKind="mathjs"
                  onChange={(octave) => { this.setState({octave}) }} />
              </th>
            </tr>
            <tr>
              <th>Freq</th>
              <th>
                <MathInput default={440}
                  wide asKind="mathjs"
                  onChange={(freq) => {
                    this._nodes.forEach((node, i) => {
                      let volume = this.defaultVolume(i, freq.value)
                      node.setState({ volume })
                    })
                    this.setState({freq})
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
            {error ? (
              <tr style={{color: 'red'}}>
                <th>Error</th>
                <th>{error.toString()}</th>
              </tr>
            ) : null}
          </tbody>
        </table>
        <table>
          <tbody>
              {Array(32).fill().map((_, i) => {
                let freq = Math.pow(octave, log(i + 1, 2)) * refFreq
                return <FreqPlayer showTypePicker={false}
                          inTable freq={freq} key={i}
                          defaultVolume={this.defaultVolume(i)}
                          ref={(v) => { this._nodes[i] = v }} />
              })}
          </tbody>
        </table>
      </div>
    )
  }
}
