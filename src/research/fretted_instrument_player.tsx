import * as React from 'react'

const romanize = require<(num: number) => string>('romanize')

import { Fraction } from './math'
import { CompactFrequencyPlayer, FractionInput } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import {
  Settings,
  ConcertPitchSetting, TConcertPitch,
  Pitch11Setting, TPitch11Setting,
  RatioCentsModeSetting, TModeSetting,
  MutedSetting, TMutedSetting
} from './settings'
import { Presets } from './presets'
import { resizeArray } from './utils'
import { clone, range } from 'lodash'

interface TRowColumnsSetting { rows: number, columns: number }
class RowsColumnsSetting<S extends TRowColumnsSetting> extends Settings<TRowColumnsSetting, S> {
  static default() { return { rows: 9, columns: 7 } }
  dump () {
    return this.props.value || { rows: 9, columns: 7 }
  }

  render () {
    let state = this.dump()
    return (
      <tr>
        <th>
          No. of Frets
        </th>
        <th>
          <input type="number" min="1" max="19" value={state.rows} onChange={(e) => {
            let rows = parseInt(e.target.value)
            this.onValue({ rows, columns: state.columns })
          }} />
        </th>
        <th>
          No. of Strings
        </th>
        <th>
          <input type="number" min="1" max="15" value={state.columns} onChange={(e) => {
            let columns = parseInt(e.target.value)
            this.onValue({ rows: state.rows, columns })
          }} />
        </th>
      </tr>
    )
  }
}

interface State extends TRowColumnsSetting, TConcertPitch, TPitch11Setting, TModeSetting, TMutedSetting {
  columnData: (Fraction | null)[],
  rowData: (Fraction | null)[],
  additional: (Fraction | null)[],
  // concertPitch: number,
  // pitch11: number,
  // mode: 'ratio' | 'cents',
  // muted: boolean,
  // size: { rows: number, columns: number },
  // columns: number
}

interface Preset {
  rows: number, columns: number,
  concertPitch: string,
  pitch11: string,
  columnData: (Fraction | null)[],
  rowData: (Fraction | null)[],
  additional: (Fraction | null)[]
}

export class FrettedInstrumentPlayer extends React.PureComponent<{}, State> {
  private concertPitch?: ConcertPitchSetting<State>
  private pitch11?: Pitch11Setting<State>
  constructor (props: {}) {
    super(props)
    this.state = {
      columnData: new Array(7).fill(null),
      rowData: new Array(9).fill(null),
      additional: new Array(9).fill(null),
      ...ConcertPitchSetting.default(),
      ...Pitch11Setting.default(),
      ...RatioCentsModeSetting.default(),
      ...MutedSetting.default(),
      ...RowsColumnsSetting.default(),
    }
  }

  onPreset (_: string, preset: Preset) {
    const { concertPitch, pitch11, rows, columns, rowData, columnData, additional } = preset
    this.setState({ rows, columns, rowData, columnData, additional }, () => {
      if (this.concertPitch)
        this.concertPitch.setText(concertPitch)
      if (this.pitch11)
        this.pitch11.setText(pitch11)
    })
  }

  render () {
    let rowData = this.state.rowData
    let columnData = this.state.columnData

    const setState = (data: any, callback: any) => {
      this.setState(data, callback)
    }
    const { concertPitch, pitch11, muted } = this.state
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <ConcertPitchSetting setState={setState} value={{ concertPitch }} ref={(e) => { if (e) this.concertPitch = e }} />
            <Pitch11Setting concertPitch={this.state.concertPitch} setState={setState} value={{ pitch11 }} ref={(e) => { if (e) this.pitch11 = e }} />
            <RowsColumnsSetting setState={(size, callback) => {
              let rowData = resizeArray(this.state.rowData, size.rows, () => null)
              let columnData = resizeArray(this.state.columnData, size.columns, () => null)
              this.setState({ rowData, columnData, rows: size.rows, columns: size.columns }, callback)
            }} value={{ rows: this.state.rows, columns: this.state.columns }} />
            <MutedSetting setState={setState} value={{ muted }} />
            <Presets name='fretted'
              onChange={this.onPreset.bind(this)}
              current={(): Preset => {
                const { rows, columns, rowData, columnData, additional } = this.state
                let concertPitch = (this.concertPitch && this.concertPitch.value()) || ''
                let pitch11 = (this.pitch11 && this.pitch11.value()) || ''
                return { rows, columns, rowData, columnData, concertPitch, pitch11, additional }
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
