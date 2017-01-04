import React, {PureComponent} from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components.jsx'
import { concertPitchToC0, ratioToCents } from './converters.js'
import { Presets } from './presets.jsx'
import { range } from 'underscore'
import { clone } from 'underline'

export class ChordPlayer extends PureComponent {
  constructor (props) {
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

  resizeArray (arr, length, fill) {
    let result = arr.slice(0, length)
    while (result.length < length) {
      result.push(fill())
    }
    return result
  }

  setRows (rows, cb) {
    if (rows < this.state.rows) {
      this.players.filter((_, i) => i >= rows)
        .forEach((row) => {
          row.forEach((player) => player.setPlaying(false))
        })
    }
    let playingAll = this.resizeArray(this.state.playingAll, rows, () => false)
    let data = this.resizeArray(this.state.data, rows, () => range(6).map((i) => i === 0 ? 1 : null))
    this.setState({ rows, playingAll, data }, cb)
  }

  onPreset (name, preset) {
    this.setRows(preset.rows, () => {
      this.refs.concertPitch.setValue(preset.concertPitch, true)
      this.refs.pitch11.setValue(preset.pitch11, true)
      preset.data.forEach((row, ri) => {
        row.forEach((input, i) => {
          this.inputs[ri][i].setValue(input, true)
        })
      })
      this.setState({ mode: preset.mode })
    })
  }

  dumpPreset () {
    return {
      rows: this.state.rows,
      mode: this.state.mode,
      concertPitch: this.refs.concertPitch.text(),
      pitch11: this.refs.pitch11.text(),
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
                  }} ref='concertPitch'/>
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} ref='pitch11'/>
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
                  this.setState({ mode: e.target.value })
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
                  style={{width: '3em'}} ref='rows'
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
            }} ref='presets' onChange={this.onPreset.bind(this)}
              current={this.dumpPreset.bind(this)} />
          </tbody>
        </table>
        <table>
          <tbody>
            {this.state.data.map((row, rowi) => {
              let isPlaying = this.state.playingAll[rowi]
              return (
                <tr key={rowi}>
                  <th>{rowi + 1}</th>
                  {row.map((e, i) => {
                    let freq = {
                      ratio: (pitch, r) => pitch * r,
                      cents: (pitch, r) => pitch * Math.pow(2, r / 1200)
                    }[this.state.mode](this.state.pitch11, e)
                    return (
                      <th key={i} style={{padding: '4px'}}>
                        <MathInput size={7} asKind="mathjs" default={i === 0 ? '1 / 1' : ''}
                          onChange={(v) => {
                            let data = this.state.data::clone()
                            data[rowi][i] = v.value
                            this.setState({ data })
                          }} ref={(ref) => {
                            if (this.inputs[rowi]) {
                              this.inputs[rowi][i] = ref
                            }
                          }} />
                        <CompactFrequencyPlayer freq={freq}
                          ref={(ref) => {
                            if (this.players[rowi]) {
                              this.players[rowi][i] = ref
                            }
                          }} />
                      </th>
                    )
                  })}
                  <th></th>
                  <th>
                    <div>
                      <button style={{background: isPlaying ? '#f15f55' : '#2196f3'}} onClick={() => {
                        let playingAll = this.state.playingAll::clone()
                        playingAll[rowi] = !isPlaying
                        this.setState({ playingAll })
                        this.players[rowi].forEach((p, i) => {
                          let data = this.state.data[rowi][i]
                          if ((data !== null) || isPlaying) {
                            p.setPlaying(!isPlaying)
                          }
                        })
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
