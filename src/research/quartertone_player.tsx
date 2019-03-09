import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import { concertPitchToC0, ratioToCents } from './converters'
import { Presets, QuickSaves } from './presets'
import { mapValues } from 'lodash'

let labels = [
  'c', '+', 'cis', '+',
  'd', '+', 'es', '+',
  'e', '+',
  'f', '+', 'fis', '+',
  'g', '+', 'as', '+',
  'a', '+', 'b', '+',
  'h', '+',
  'c'
];
let octaveRows = [
  ' x x  x x x  ',
  ' x x  x x x  ',
  'x x xx x x x ',
  'x x xx x x xx',
]

let indices: { [key: string]: number } = {}
let _idx = 0
for (let i = 0; i < octaveRows[0].length; i++) {
  for (let row of [3, 2, 1, 0]) {
    if (octaveRows[row][i] === 'x') {
      indices[row + ", " + i] = _idx++
    }
  }
}

interface State {
  concertPitch: number,
  pitch11: number,
  muted: boolean,
}

interface SaveState {
  playing: { [octave: number]: { [idx: number]: boolean } }
}


export class QuartertonePlayer extends React.PureComponent<{}, State> {
  private players: { [octave: number]: { [idx: number]: CompactFrequencyPlayer } }
  private quicksaves?: QuickSaves<SaveState>

  constructor(props: {}) {
    super(props)
    this.state = {
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      muted: false,
    }
    this.players = {}
  }

  _setPlayerRef(octave: number, index: number, ref: CompactFrequencyPlayer | null) {
    if (ref === null) return
    if (!this.players[octave])
      this.players[octave] = {}
    this.players[octave][index] = ref
  }

  renderElement(index: number, octave: number) {
    let freq = Math.pow(2, (-66 + index) / 24) * this.state.concertPitch * Math.pow(2, octave)
    let muted = this.state.muted
    return (
      <div>
        <CompactFrequencyPlayer freq={freq} muted={muted}
          text={labels[index]} ref={(ref) => this._setPlayerRef(octave, index, ref)}
          buttonStyle={{ width: '100%' }} />
      </div>
    )
  }

  renderOctave(name: string, octave: number) {
    return <>
      <h3>{name}</h3>
      <table>
        <tbody>
          {octaveRows.map((row, rowi) => {
            return (
              <tr key={rowi}>
                {row.split('').map((c, i) => {
                  return (
                    <td key={i} style={{ padding: '0px' }}>
                      {
                        c === 'x'
                          ? this.renderElement(indices[rowi + ", " + i], octave)
                          : null
                      }
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  }

  render() {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)

    this.players = new Array(6).fill(null)
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
            <tr>
              <th>Mute</th>
              <th>
                <button onClick={() => {
                  this.setState({ muted: !this.state.muted })
                }}>{this.state.muted ? 'un' : ''}mute</button>
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <Presets name='quartertoneQuicksaves' label='Music Preset'
              default={{ saves: [null, null, null, null] }} newAsDefault
              onChange={(_, state) => this.quicksaves && this.quicksaves.setState(state)}
              current={() => (this.quicksaves && this.quicksaves.state) || { saves: [] }} />
            <tr>
              <th>Playing</th>
              <th>
                <QuickSaves
                  load={(save) => {
                    for (let _octave of Object.keys(save.playing)) { // TODO: ES2017 entries
                      let octave = parseInt(_octave)
                      for (let _i of Object.keys(save.playing[octave])) {
                        let i = parseInt(_i);
                        let playing = save.playing[octave][i]
                        let player = (this.players[octave] || {})[i]
                        if (player) player.setPlaying(playing)
                      }
                    }
                  }}
                  saveData={() => {
                    return {
                      playing: mapValues(this.players, octave => mapValues(octave, player => player.state.isPlaying))
                    }
                  }}
                  ref={(e: QuickSaves<SaveState>) => { if (e) this.quicksaves = e }}
                />
              </th>
            </tr>
          </tbody>
        </table>
        {this.renderOctave("3. Oktave", 4)}
        {this.renderOctave("2. Oktave", 3)}
        {this.renderOctave("1. Oktave", 2)}
        {this.renderOctave("Kl. Oktave", 1)}
        {this.renderOctave("Gr. Oktave", 0)}
      </div>
    )
  }
}
