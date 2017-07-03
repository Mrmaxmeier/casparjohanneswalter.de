import * as React from 'react'

const romanize = require<(num: number) => string>('romanize')

import { Fraction } from './math'
import { CompactFrequencyPlayer, FractionInput } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import {
  Settings,
  ConcertPitchSetting,
  Pitch11Setting,
  RatioCentsModeSetting,
  MutedSetting
} from './settings'
import { Presets } from './presets'
import { resizeArray } from './utils'
import { clone, range } from 'lodash'

class RowsColumnsSetting extends Settings<{ rows: number, columns: number }, { size: { rows: number, columns: number } }> {
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
          <input type="number" min="1" max="19" value={this.state.rows} onChange={(e) => {
            let rows = parseInt(e.target.value)
            this.onValue({ rows, columns: this.state.columns })
          }} />
        </th>
        <th>
          No. of Strings
        </th>
        <th>
          <input type="number" min="1" max="15" value={this.state.columns} onChange={(e) => {
            let columns = parseInt(e.target.value)
            this.onValue({ rows: this.state.rows, columns })
          }} />
        </th>
      </tr>
    )
  }
}

interface State {
  columnData: Fraction[],
  rowData: Fraction[],
  additional: Fraction[],
  concertPitch: number,
  pitch11: number,
  mode: 'ratio' | 'cents',
  muted: boolean,
  size: { rows: number, columns: number },
  columns: number
}

interface Preset {
  size: { rows: number, columns: number },
  concertPitch: number,
  pitch11: number,
}

export class FrettedInstrumentPlayer extends React.PureComponent<{}, State> {
  private size: RowsColumnsSetting
  private concertPitch: ConcertPitchSetting
  private pitch11: Pitch11Setting
  constructor (props: {}) {
    super(props)
    this.state = Settings.state<Preset>(
      ConcertPitchSetting,
      Pitch11Setting,
      RatioCentsModeSetting,
      MutedSetting,
      RowsColumnsSetting
    )
    this.state = {
      columnData: new Array(7).fill(null),
      rowData: new Array(9).fill(null),
      additional: new Array(9).fill(null),
      ...this.state
    }
  }

  onPreset (_: any, preset: Preset) {
    this.setState(preset)
    Settings.onPreset<Preset>([
      this.size,
      this.concertPitch,
      this.pitch11
    ], preset)
  }

  render () {
    let rowData = this.state.rowData
    let columnData = this.state.columnData

    let updateState = Settings.updateState(this)
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <ConcertPitchSetting updateState={updateState} ref={(e) => { if(e) this.concertPitch = e }} />
            <Pitch11Setting concertPitch={this.state.concertPitch} updateState={updateState} ref={(e) => { if (e) this.pitch11 = e }} />
            <RowsColumnsSetting updateState={(size) => {
              let rowData = resizeArray(this.state.rowData, size.rows, () => null)
              let columnData = resizeArray(this.state.columnData, size.columns, () => null)
              this.setState({ rowData, columnData, size })
            }} ref={(e) => { if(e) this.size = e }} />
            <MutedSetting updateState={updateState} />
            {
              /*
                <RatioCentsModeSetting updateState={updateState} />
                TODO
              */
            }
            <Presets name='fretted'
              onChange={this.onPreset.bind(this)}
              current={() => {
                return Settings.dumpPreset([
                  this.size,
                  this.concertPitch,
                  this.pitch11
                ], this.state)
              }} />
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
                    let columnData = clone(this.state.columnData)
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
                let freq = column.value * this.state.pitch11
                return (
                  <th key={coli}>
                    <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                      text={column.numerator + ' / ' + column.denominator} buttonStyle={{width: '100%'}} />
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
                    let rowData = clone(this.state.rowData)
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
                  let r = new Fraction(row.numerator, row.denominator)
                  let c = new Fraction(column.numerator, column.denominator)
                  let v = r.mul(c)

                  let freq = v.value * this.state.pitch11
                  return (
                    <th key={coli}>
                      <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                        text={v.numerator + ' / ' + v.denominator} buttonStyle={{width: '100%'}} />
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
                    let additional = clone(this.state.additional)
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
                let freq = v.value * this.state.pitch11
                return (
                  <th key={i}>
                    <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
                      text={v.numerator + ' / ' + v.denominator} buttonStyle={{width: '100%'}} />
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
