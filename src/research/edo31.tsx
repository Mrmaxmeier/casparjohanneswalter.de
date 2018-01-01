import * as React from 'react'
import { range, mapValues, clone } from 'lodash'

import { MathInput, PrecNumber } from './components'
import { FrequencyNode, AudioController, AudioControllerRow } from './audioComponents'
import { ratioToCents, centsToRatio } from './converters'
import { Presets, QuickSaves } from './presets'
import { resizeArray } from './utils'
const romanize = require<(num: number) => string>('romanize')

const labels = [
  ['E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E'],
  ['A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A'],
  ['D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D'],
  ['G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G'],
  ['B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮'],
  ['E', 'F♭', 'E♯', 'F', 'G♭♭', 'F♯', 'G♭', 'F♯♯', 'G', 'A♭♭', 'G♯', 'A♭', 'G♯♯', 'A', 'B♭♭', 'A♯', 'B♭', 'A♯♯', 'B♮', 'C♭', 'B♯', 'C', 'D♭♭', 'C♯', 'D♭', 'C♯♯', 'D', 'E♭♭', 'D♯', 'E♭', 'D♯♯', 'E'],
]


interface RowProps {
  y: number,
  centralC: number,
  editmode: boolean
}

interface RowState {
  playing: boolean[],
  visible: boolean[]
}

class Row extends React.PureComponent<RowProps, RowState> {
  constructor (props: RowProps) {
    super(props)
    this.state = {
      playing: new Array(COLUMNS).fill(false),
      visible: new Array(COLUMNS).fill(true)
    }
  }

  render () {
    let { y, centralC } = this.props
    return (
      <tr key={y}>
        <th style={{ padding: 0 }}>{y}</th>
        {range(0, COLUMNS).map(index => {
          const shift = [0, 13, 26, 39, 49, 62][index]
          const cents = (1200 / 31) * (y + shift)
          const freq = centsToRatio(cents) * centralC
          if (!this.props.editmode && !this.state.visible[index]) {
            return <td key={index} style={{ height: '0.8em', width: '3em' }} />
          }
          return (
            <td key={index} style={{padding: '4px'}}>
              <FrequencyNode freq={freq} playing={this.state.playing[index]} />
              <div style={{ textAlign: 'center' }}>
                {this.props.editmode ? (
                  <div>
                    <div style={{ textAlign: 'center' }}>
                      <PrecNumber value={cents} precision={0} />
                    </div>
                    <button
                      onClick={() => {
                        let visible = clone(this.state.visible)
                        visible[index] = !visible[index]
                        this.setState({ visible })
                      }}
                      style={{
                        color: 'black',
                        background: this.state.visible[index] ? '#ABF2A5' : '#FAEEDC',
                        paddingTop: 0,
                        height: '1em',
                        width: '3em',
                        textDecoration: this.state.visible[index] ? null : 'line-through'
                      }}
                    >
                      {labels[index][y]}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      let playing = clone(this.state.playing)
                      playing[index] = !playing[index]
                      this.setState({ playing })
                    }}
                    style={{
                      background: this.state.playing[index] ? '#f15f55' : '#2196f3',
                      paddingTop: 0,
                      height: '1em',
                      width: '3em'
                    }}
                  >
                    {labels[index][y]}
                  </button>
                )}
              </div>
            </td>
          )
        })}
      </tr>
    )
  }
}

interface MatrixProps {
  centralC: number,
  data: number[][],
  onChange: (data: number[][]) => void,
  editmode: boolean
}

interface State {
  centralC: number,
  editmode: boolean
}

type QuicksaveState = RowState[];

type GPresets = new () => Presets<(RowState[] | null)[]>;
const GPresets = Presets as GPresets;
type GQuickSaves = new () => QuickSaves<QuicksaveState>;
const GQuickSaves = QuickSaves as GQuickSaves;

const ROWS = 32
const COLUMNS = 6

export class EDO31 extends React.PureComponent<{}, State> {
  private rows: Row[]
  private centralC: MathInput
  private quicksaves: QuickSaves<QuicksaveState>

  constructor (props: {}) {
    super(props)
    this.state = {
      centralC: 440 / Math.pow(2, 17 / 12),
      editmode: false
    }
  }

  render () {
    this.rows = new Array(ROWS).fill(null);
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Pitch Low E</th>
              <td>
                <MathInput
                  wide default="440 / 2^(17/12)"
                  onChange={(centralC) => {
                    this.setState({ centralC })
                  }} ref={(e) => { if (e) this.centralC = e }} />
              </td>
            </tr>
            <tr>
              <th>Edit-mode</th>
              <td>
                <input type="checkbox" checked={this.state.editmode} onChange={(e) => {
                  const editmode = e.target.checked
                  this.setState({ editmode })
                }}/>
              </td>
            </tr>
            <GPresets name='edo31_quicksaves'
              label="Saves"
              onChange={(key: string, saves: (QuicksaveState | null)[]) => this.quicksaves.setState({ saves })}
              current={() => this.quicksaves.state.saves} />
          </tbody>
        </table>
        <GQuickSaves
          load={(save: QuicksaveState) => {
            save.forEach((row, i) => {
              this.rows[i].setState(row)
            })
          }}
          saveData={() =>
            this.rows.map((row: Row) => row.state)
          }
          ref={(e: QuickSaves<QuicksaveState>) => { if (e) this.quicksaves = e }}
        />

        <table>
          <tbody>
            <tr>
              <th />
              {range(0, COLUMNS).map(x => (
                <th key={x}>{romanize(6 - x)}</th>
              ))}
            </tr>
            {range(0, ROWS).map(y => (
              <Row
                y={y} key={y}
                centralC={this.state.centralC}
                ref={(e) => { if (e) this.rows[y] = e }}
                editmode={this.state.editmode}
              />
            ))}
            <tr>
              <td>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
