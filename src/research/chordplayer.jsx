import React, {Component} from 'react'
import math from 'mathjs'

import { RequiresJS, MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components.jsx'
import { concertPitchToC0, ratioToCents } from './converters.js'
import { range, clone } from 'underscore'


export class ChordPlayer extends Component {
  constructor (props) {
    super(props)
    this.state = {
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(8).fill(null).map(() => new Array(6).fill(1)),
      playingAll: new Array(8).fill(false)
    }
    this.players = new Array(8).fill(null).map(() => new Array(6).fill(undefined))
  }

  render () {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)
    return (
      <div>
        <RequiresJS />
        <table>
          <tbody>
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror"
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
                  wide asKind="mathjs-ignoreerror" default="440 / 9 * 8"
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
            {this.state.data.map((row, rowi) => {
              let isPlaying = this.state.playingAll[rowi]
              return (
                <tr key={rowi}>
                  {row.map((e, i) => {
                    return (
                      <th key={i}>
                        <MathInput asKind="mathjs-ignoreerror" default="1 / 1"
                          onChange={(value) => {
                            let data = clone(this.state.data)
                            data[rowi][i] = value
                            this.setState({ data })
                          }} />
                        <CompactFrequencyPlayer freq={this.state.pitch11 * e}
                          ref={(ref) => {
                            this.players[rowi][i] = ref
                          }} />
                      </th>
                    )
                  })}
                  <th></th>
                  <th>
                    <div>
                      <button style={{background: isPlaying ? '#f15f55' : '#2196f3'}} onClick={() => {
                        let playingAll = clone(this.state.playingAll)
                        playingAll[rowi] = !isPlaying
                        this.setState({ playingAll })
                        this.players[rowi].forEach((p) => p.setPlaying(!isPlaying))
                      }}>{isPlaying ? 'Stop All' : 'Play All'}</button>
                    </div>
                  </th>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
}
