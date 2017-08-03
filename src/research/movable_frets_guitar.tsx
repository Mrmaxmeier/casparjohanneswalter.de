import * as React from 'react'
import { range, mapValues, clone } from 'lodash'

import { MathInput, PrecNumber } from './components'
import { FrequencyNode, AudioController, AudioControllerRow } from './audioComponents'
import { ratioToCents, centsToRatio } from './converters'
import { QuickSaves } from './limit5matrix'
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

interface RowProps {
  y: number,
  centralC: number,
  data: (x: number, y: number) => { step: number, octave: number }
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
        {range(0, 19).map(x => {
          const index = (x + 4)
          const { step, octave } = this.props.data(x, y)
          const cents = 1200 / 53 * step + 1200 * octave
          const freq = centsToRatio(cents) * centralC
          return (
            <td key={x} style={{padding: '4px'}}>
              <FrequencyNode freq={freq} playing={this.state.playing[index]} />
              <div style={{ textAlign: 'center' }}>
                <PrecNumber value={cents % 1200} precision={0} />
              </div>
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
  data: (x: number, y: number) => { step: number, octave: number }
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
              data={this.props.data}
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


interface State {
  centralC: number,
  playing: boolean[],
}

interface SaveState {
  cents: number[][],
  playing: boolean[][]
}

export class MovableFretsGuitarPlayer extends React.PureComponent<{}, State> {
  private matrices: Matrix[]
  private centralC: MathInput
  private quicksaves: QuickSaves<SaveState[]>

  constructor (props: {}) {
    super(props)
    this.state = {
      centralC: 440 / Math.pow(2, 21 / 12),
      playing: new Array(WIDTH * HEIGHT).fill(false),
    }
    this.matrices = new Array(3).fill(null)
  }

  render () {
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
          </tbody>
        </table>
        <QuickSaves
          load={(save: SaveState[]) => {
            save.map((matrix, i) => {
              Object.keys(matrix.cents).map((s) => {
                let key = parseInt(s)
                let cents = matrix.cents[key]
                if (this.matrices[i].rows[key] && cents !== null) {
                  this.matrices[i].rows[key].setState({ cents })
                }
              })
              Object.keys(matrix.playing).map((s) => {
                let key = parseInt(s)
                let playing = matrix.playing[key]
                if (this.matrices[i].rows[key] && playing !== null) {
                  this.matrices[i].rows[key].setState({ playing })
                }
              })
            })
          }}
          saveData={() => {
            return this.matrices.map(matrix => { return {
              cents: matrix.rows.map((o: Row) => o ? o.state.cents : new Array(WIDTH).fill(0)),
              playing: matrix.rows.map((o: Row) => o ? o.state.playing : new Array(WIDTH).fill(false))
            }})
          }}
          ref={(e: QuickSaves<SaveState[]>) => { if (e) this.quicksaves = e }}
        />
        <h4>Guitar 1</h4>
        <Matrix centralC={this.state.centralC} data={(x, y) => {
          return { step: pre[y][x][0] + 2, octave: pre[y][x][1] }
        }} ref={(e) => { if (e) this.matrices[0] = e}}/>
        <h4>Guitar 2</h4>
        <Matrix centralC={this.state.centralC} data={(x, y) => {
          return { step: pre[y][x][0], octave: pre[y][x][1] }
        }} ref={(e) => { if (e) this.matrices[1] = e}}/>
        <h4>Guitar 3</h4>
        <Matrix centralC={this.state.centralC} data={(x, y) => {
          return { step: pre[y][x][0] - 2, octave: pre[y][x][1] }
        }} ref={(e) => { if (e) this.matrices[2] = e}}/>
      </div>
    )
  }
}
