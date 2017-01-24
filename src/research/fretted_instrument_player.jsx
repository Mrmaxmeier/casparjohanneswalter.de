import React, {PureComponent} from 'react'
import math from 'mathjs'
import romanize from 'romanize'

math.config({number: 'Fraction'}) // :(

import { CompactFrequencyPlayer, FractionInput } from './components.jsx'
import {
  Settings,
  ConcertPitchSetting,
  Pitch11Setting,
  RatioCentsModeSetting,
  MutedSetting
} from './settings.jsx'
import { Presets } from './presets.jsx'
import { resizeArray } from './utils.js'
import { clone } from 'underline'
import { range } from 'underscore'


class RowsColumnsSetting extends Settings {
  static field = 'size';
  static default = {rows: 9, columns: 7};
  cls () { return RowsColumnsSetting }
  render () {
    return (
      <tr>
        <th>
          No. of Frets
        </th>
        <th>
          <input type="number" min="1" max="19" value={this.state.value.rows} onChange={(e) => {
            let rows = parseInt(e.target.value)
            this.onValue({ rows, columns: this.state.value.columns })
          }} />
        </th>
        <th>
          No. of Strings
        </th>
        <th>
          <input type="number" min="1" max="15" value={this.state.value.columns} onChange={(e) => {
            let columns = parseInt(e.target.value)
            this.onValue({ rows: this.state.value.rows, columns })
          }} />
        </th>
      </tr>
    )
  }
}


export class FrettedInstrumentPlayer extends PureComponent {
  constructor (props) {
    super(props)
    this.state = Settings.state(
      ConcertPitchSetting,
      Pitch11Setting,
      RatioCentsModeSetting,
      MutedSetting,
      RowsColumnsSetting
    )
    this.state = Object.assign(this.state, {
      columnData: new Array(7).fill(null),
      rowData: new Array(9).fill(null),
      additional: new Array(9).fill(null),
      muted: false
    })
  }

  onPreset (_, preset) {
    this.setState(preset)
    Settings.onPreset([
      this.refs.size,
      this.refs.concertPitch,
      this.refs.pitch11
    ], preset)
  }

  render () {
    let rowData = this.state.rowData
    let columnData = this.state.columnData

    let updateState = Settings.updateState(this)
    return (
      <div>
        <table>
          <tbody>
            <ConcertPitchSetting updateState={updateState} ref="concertPitch" />
            <Pitch11Setting concertPitch={this.state.concertPitch} updateState={updateState} ref="pitch11" />
            <RowsColumnsSetting updateState={(v) => {
              let rowData = resizeArray(this.state.rowData, v.rows)
              let columnData = resizeArray(this.state.columnData, v.columns)
              this.setState({ rowData, columnData, rows: v.rows, columns: v.columns })
            }} ref="size" />
            <MutedSetting updateState={updateState} />
            {
              /*
                <RatioCentsModeSetting updateState={updateState} />
                TODO
              */
            }
            <Presets name='fretted' ref='presets'
              onChange={this.onPreset.bind(this)}
              current={() => this.state::clone()} />
          </tbody>
        </table>

        <table>
          <tbody>
            <tr>
              <th></th>
              <th></th>
              {range(this.state.columns).map((i) =>
                <th key={i}>{romanize(this.state.columns - i)}</th>
              )}
            </tr>
            <tr>
              <th></th>
              <th></th>
              {columnData.map((v, i) =>
                <th key={i}>
                  <FractionInput onValue={(v) => {
                    let columnData = this.state.columnData::clone()
                    columnData[i] = v
                    this.setState({ columnData })
                  }} value={v} />
                </th>
              )}
            </tr>
            <tr>
              <th> 0 </th>
              <th></th>
              {columnData.map((column, coli) => {
                if (!column) {
                  return (
                    <th key={coli}></th>
                  )
                }
                let v = math.fraction(column.numerator, column.denominator)
                let freq = v.valueOf() * this.state.pitch11
                return (
                  <th key={coli}>
                    <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                      text={v.n + ' / ' + v.d} buttonStyle={{width: '100%'}} />
                  </th>
                )
              }
              )}
            </tr>
            {rowData.map((row, rowi) =>
              <tr key={rowi}>
                <th>
                  {rowi + 1}
                </th>
                <th>
                  <FractionInput onValue={(v) => {
                    let rowData = this.state.rowData::clone()
                    rowData[rowi] = v
                    this.setState({ rowData })
                  }} value={row} />
                </th>
                {columnData.map((column, coli) => {
                  if (!row || !column) {
                    return (
                      <th key={coli}></th>
                    )
                  }
                  let r = math.fraction(row.numerator, row.denominator)
                  let c = math.fraction(column.numerator, column.denominator)
                  let v = math.fraction(math.multiply(r, c))

                  let freq = v.valueOf() * this.state.pitch11
                  return (
                    <th key={coli}>
                      <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                        text={v.n + ' / ' + v.d} buttonStyle={{width: '100%'}} />
                    </th>
                  )
                }
                )}
              </tr>
            )}
          </tbody>
        </table>

        <h5>Additional Strings:</h5>
        <table>
          <tbody>
            <tr>
              {this.state.additional.map((v, i) =>
                <th key={i}>
                  <FractionInput onValue={(v) => {
                    let additional = this.state.additional::clone()
                    additional[i] = v
                    this.setState({ additional })
                  }} value={v} />
                </th>
              )}
            </tr>
            <tr>
              {this.state.additional.map((v, i) => {
                if (!v) {
                  return (
                    <th key={i}></th>
                  )
                }
                v = math.fraction(v.numerator, v.denominator)
                let freq = v.valueOf() * this.state.pitch11
                return (
                  <th key={i}>
                    <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                      text={v.n + ' / ' + v.d} buttonStyle={{width: '100%'}} />
                  </th>
                )
              }
              )}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
