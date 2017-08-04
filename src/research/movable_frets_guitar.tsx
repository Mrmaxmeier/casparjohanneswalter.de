import * as React from 'react'
import { range, mapValues, clone } from 'lodash'

import { MathInput, PrecNumber } from './components'
import { FrequencyNode, AudioController, AudioControllerRow } from './audioComponents'
import { ratioToCents, centsToRatio } from './converters'
import { Presets, QuickSaves } from './presets'
import { resizeArray } from './utils'
const romanize = require<(num: number) => string>('romanize')

const labels = [
  ['E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮'],
  ['B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯'],
  ['G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D'],
  ['D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A'],
  ['A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E'],
  ['E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮', 'C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B♮'],
]

let pre = [
  [ // 1.Saite
    [17, 2], [21, 2], [26, 2], [30, 2], [34, 2], [39, 2], [43, 2], [48, 2], [52, 2], [4, 3], [8, 3], [12, 3], [17, 3], [21, 3], [26, 3], [30, 3], [34, 3], [39, 3], [43, 3], [48, 3]
  ],
  [ // 2.Saite
    [48, 1], [52, 1], [4, 2], [8, 2], [13, 2], [17, 2], [21, 2], [26, 2], [30, 2], [35, 2], [39, 2], [43, 2], [48, 2], [52, 2], [4, 3], [8, 3], [13, 3], [17, 3], [21, 3], [26, 3]
  ],
  [ // 3.Saite
    [31, 1], [35, 1], [39, 1], [44, 1], [48, 1], [0, 2], [4, 2], [8, 2], [13, 2], [17, 2], [22, 2], [26, 2], [31, 2], [35, 2], [39, 2], [44, 2], [48, 2], [0, 3], [4, 3], [8, 3]
  ],
  [ // 4.Saite
    [9, 1], [13, 1], [18, 1], [22, 1], [26, 1], [31, 1], [35, 1], [40, 1], [44, 1], [49, 1], [0, 2], [4, 2], [9, 2], [13, 2], [18, 2], [22, 2], [26, 2], [31, 2], [35, 2], [40, 2]
  ],
  [ // 5.Saite
    [40, 0], [44, 0], [49, 0], [0, 1], [5, 1], [9, 1], [14, 1], [18, 1], [22, 1], [27, 1], [31, 1], [36, 1], [40, 1], [44, 1], [49, 1], [0, 2], [5, 2], [9, 2], [14, 2], [18, 2]
  ],
  [ // 6.Saite
    [18, 0], [23, 0], [27, 0], [32, 0], [36, 0], [40, 0], [45, 0], [49, 0], [1, 1], [5, 1], [9, 1], [14, 1], [18, 1], [23, 1], [27, 1], [32, 1], [36, 1], [40, 1], [45, 1], [49, 1]
  ],
]

const WIDTH = 20
const HEIGHT = 6

const combined = [
  (x: number, y: number) => {
    return { step: pre[y][x][0] + 2, octave: pre[y][x][1] }
  },
  (x: number, y: number) => {
    return { step: pre[y][x][0], octave: pre[y][x][1] }
  },
  (x: number, y: number) => {
    return { step: pre[y][x][0] - 2, octave: pre[y][x][1] }
  },
].map((func) =>
  range(0, 6).map((y) =>
    range(0, 20).map((x) => {
      const { step, octave } = func(x, y)
      return 1200 / 53 * step + 1200 * octave
    })
  )
)

interface RowProps {
  y: number,
  centralC: number,
  data: number[],
  onChange: (data: number[]) => void,
  editmode: boolean
}

interface RowState {
  cents: number[],
  playing: boolean[]
}

class Row extends React.PureComponent<RowProps, RowState> {
  constructor (props: RowProps) {
    super(props)
    this.state = {
      cents: new Array(WIDTH).fill(0),
      playing: new Array(WIDTH).fill(false)
    }
  }

  render () {
    let { y, centralC } = this.props
    return (
      <tr key={y}>
        <th>{y + 1}</th>
        {range(0, 20).map(x => {
          const index = (x + 4)
          const cents = this.props.data[x]
          const freq = centsToRatio(cents) * centralC
          return (
            <td key={x} style={{padding: '4px'}}>
              <FrequencyNode freq={freq} playing={this.state.playing[index]} />
              {this.props.editmode ? (
                <div>
                  <input
                    type="number"
                    value={Math.round(cents)}
                    onChange={(e) => {
                      const data = [...this.props.data];
                      data[x] = parseInt(e.target.value)
                      this.props.onChange(data)
                    }}
                    style={{ width: '5em' }}
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <PrecNumber value={cents % 1200} precision={0} />
                </div>
              )}
              {/* <pre>{valueS}</pre> */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    let playing = clone(this.state.playing)
                    playing[index] = !playing[index]
                    this.setState({ playing })
                  }}
                  style={{
                    background: this.state.playing[index] ? '#f15f55' : '#2196f3',
                    paddingTop: 0,
                    height: '1em'
                  }}
                >
                  {labels[y][x]}
                </button>
                {/*
                <br />
                <input
                  type="number"
                  value={this.state.cents[index]}
                  style={{ width: '3em' }}
                  onChange={(e) => {
                    let cents = clone(this.state.cents)
                    cents[index] = parseInt(e.target.value)
                    this.setState({ cents })
                  }}
                />
                */}
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

class Matrix extends React.PureComponent<MatrixProps, {}> {
  rows: Row[]
  constructor(props: MatrixProps) {
    super(props)
    this.rows = new Array(HEIGHT).fill(null)
  }
  render () {
    return (
      <table>
        <tbody>
          <tr>
            <th />
            <th />
            {range(0, 19).map(x => (
              <th key={x}>{romanize(x + 1)}</th>
            ))}
          </tr>
          {range(0, 6).map(y => (
            <Row
              y={y} key={y}
              centralC={this.props.centralC}
              ref={(e) => { if (e) this.rows[y] = e }}
              data={this.props.data[y]}
              onChange={(newData) => {
                const data = [...this.props.data];
                data[y] = newData
                this.props.onChange(data)
              }}
              editmode={this.props.editmode}
            />
          ))}
          <tr>
            <td>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }
}

interface Preset {
  data: { step: number, octave: number }[][],
  editable: boolean
}

interface State {
  centralC: number,
  playing: boolean[],
  data: number[][][],
  editmode: boolean
}

type QuicksaveState = { [key: number]: boolean[][] };

export class MovableFretsGuitarPlayer extends React.PureComponent<{}, State> {
  private matrices: { [key: number]: Matrix }
  private centralC: MathInput
  private quicksaves: QuickSaves<QuicksaveState>

  constructor (props: {}) {
    super(props)
    this.state = {
      centralC: 440 / Math.pow(2, 21 / 12),
      playing: new Array(WIDTH * HEIGHT).fill(false),
      data: combined,
      editmode: false
    }
  }

  render () {
    this.matrices = {}
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Pitch Central C</th>
              <td>
                <MathInput
                  wide default="440 / 2^(21/12)"
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
            {this.state.editmode ? (
              <tr>
                <th>Rows</th>
                <td>
                  <input type="number" min={0} max={5} value={this.state.data.length} onChange={(e) => {
                    const len = parseInt(e.target.value)
                    const data = resizeArray(this.state.data, len, () => {
                      return range(0, 6).map((y) =>
                        range(0, 20).map((x) => 0)
                      )
                    });
                    this.setState({ data })
                  }}/>
                </td>
              </tr>
            ) : null}
            <Presets name='movable_frets_presets' default={combined}
              onChange={(key: string, data: number[][][]) => this.setState({ data })}
              current={() => this.state.data} />
            <Presets name='movable_frets_quicksaves'
              label="Saves"
              onChange={(key: string, saves: (QuicksaveState | null)[]) => this.quicksaves.setState({ saves })}
              current={() => this.quicksaves.state.saves} />
          </tbody>
        </table>
        <QuickSaves
          load={(save: QuicksaveState) => {
            Object.keys(this.matrices).map((s) => {
              const key = parseInt(s)
              if (save[key]) {
                this.matrices[key].rows.map((row, rowi) => {
                  const playing = save[key][rowi]
                  row.setState({ playing })
                })
              }
            })
          }}
          saveData={() =>
            mapValues(this.matrices, (matrix: Matrix) => 
              matrix.rows.map(
                (o: Row) => o ? o.state.playing : new Array(WIDTH).fill(false)
              )
            )
          }
          ref={(e: QuickSaves<QuicksaveState>) => { if (e) this.quicksaves = e }}
        />
        {this.state.data.map((matrix, i) =>
          <div key={i}>
            <h4>Guitar {i + 1}</h4>
            <Matrix
              centralC={this.state.centralC}
              data={matrix}
              ref={(e) => { if (e) this.matrices[i] = e}}
              onChange={(newData) => {
                const data = [...this.state.data];
                data[i] = newData
                this.setState({ data })
              }}
              editmode={this.state.editmode}
            />
          </div>
        )}
      </div>
    )
  }
}
