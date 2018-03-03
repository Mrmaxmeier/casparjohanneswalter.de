import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer, PlayAllButton } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import { concertPitchToC0, ratioToCents } from './converters'
import { resizeArray } from './utils'
import { Presets } from './presets'
import { range, clone } from 'lodash'

interface State {
  rows: number,
  concertPitch: number,
  pitch11: number,
  mode: 'ratio' | 'cents',
  playingAll: boolean[],
  data: (number | null)[][]
}

interface Preset {
  rows: number,
  mode: 'ratio' | 'cents',
  concertPitch: string,
  pitch11: string,
  data: string[][]
}

export class ChordPlayer extends React.PureComponent<{}, State> {
  private players: CompactFrequencyPlayer[][]
  private inputs: MathInput[][]
  private rows?: HTMLInputElement
  private concertPitch?: MathInput
  private pitch11?: MathInput

  constructor (props: {}) {
    super(props)
    let rows = 8
    this.state = {
      rows,
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(rows).fill(null).map(
        () => range(6).map((i) => i === 0 ? 1 : null)
      ),
      playingAll: new Array(rows).fill(false),
      mode: 'ratio'
    }
    this.players = []
    this.inputs = []
  }

  setRows (rows: number, cb?: () => void) {
    if (rows < this.state.rows) {
      this.players.filter((_, i) => i >= rows)
        .forEach((row) => {
          row.forEach((player) => player.setPlaying(false))
        })
    }
    let playingAll = resizeArray(this.state.playingAll, rows, () => false)
    let data = resizeArray(this.state.data, rows, () => range(6).map((i) => i === 0 ? 1 : null))
    this.setState({ rows, playingAll, data }, cb)
  }

  onPreset (name: string, preset: Preset) {
    this.setRows(preset.rows, () => {
      if (this.concertPitch)
        this.concertPitch.setValue(preset.concertPitch, true)
      if (this.pitch11)
        this.pitch11.setValue(preset.pitch11, true)
      preset.data.forEach((row, ri) => {
        row.forEach((input, i) => {
          this.inputs[ri][i].setValue(input, true)
        })
      })
      this.setState({ mode: preset.mode })
    })
  }

  dumpPreset (): Preset {
    return {
      rows: this.state.rows,
      mode: this.state.mode,
      concertPitch: (this.concertPitch && this.concertPitch.text()) || "",
      pitch11: (this.pitch11 && this.pitch11.text()) || "",
      data: range(this.state.rows).map((ri) => {
        return range(6).map((i) => this.inputs[ri][i].text())
      })
    }
  }

  render () {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)

    this.players = range(this.state.rows).map(() => new Array(6).fill(null))
    this.inputs = range(this.state.rows).map(() => new Array(6).fill(null))
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
                  }} ref={(e) => { if (e) this.concertPitch = e }}/>
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} ref={(e) => { if (e) this.pitch11 = e }} />
              </th>
              <th>
                <NoteImage cents={cents} />
              </th>
              <th>
                <NoteDisplay cents={cents} />
              </th>
            </tr>
            <tr>
              <th>Mode</th>
              <th>
                <select onChange={(e) => {
                  let mode = e.target.value
                  if (mode === 'ratio' || mode === 'cents')
                    this.setState({ mode })
                }} value={this.state.mode}>
                  <option value="ratio">Ratio</option>
                  <option value="cents">Cents</option>
                </select>
              </th>
            </tr>
            <tr>
              <th>Rows</th>
              <th>
                <input type="number" name="rows"
                  min="1" value={this.state.rows}
                  style={{width: '3em'}} ref={(e) => { if (e) this.rows = e }}
                  onChange={(event) => {
                    let rows = parseInt(event.target.value)
                    this.setRows(rows)
                  }}/>
              </th>
            </tr>
            <Presets name='chordPlayerPresets' default={{
              concertPitch: '440',
              pitch11: '440 / 9 * 8',
              rows: 8,
              mode: 'ratio',
              data: range(8).map(() => ['1 / 1', '', '', '', '', ''])
            }} onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
          </tbody>
        </table>
        <table>
          <tbody>
            {this.state.data.map((row, rowi) => {
              return (
                <tr key={rowi}>
                  <th>{rowi + 1}</th>
                  {row.map((e, i) => {
                    let freq = {
                      ratio: (pitch: number, r: number) => pitch * r,
                      cents: (pitch: number, r: number) => pitch * Math.pow(2, r / 1200)
                    }[this.state.mode](this.state.pitch11, e || 0)
                    return (
                      <th key={i} style={{padding: '4px'}}>
                        <MathInput size={7} default={i === 0 ? '1 / 1' : ''}
                          onChange={(v) => {
                            let data = clone(this.state.data)
                            data[rowi][i] = v
                            this.setState({ data })
                          }} ref={(ref) => {
                            if (this.inputs[rowi] && ref) {
                              this.inputs[rowi][i] = ref
                            }
                          }} />
                        <CompactFrequencyPlayer freq={freq}
                          ref={(ref) => {
                            if (this.players[rowi] && ref) {
                              this.players[rowi][i] = ref
                            }
                          }} />
                      </th>
                    )
                  })}
                  <th />
                  <th>
                    <PlayAllButton playerRefs={this.players[rowi]} />
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
