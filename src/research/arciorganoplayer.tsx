import * as React from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'
import { concertPitchToC0, ratioToCents, evalMathN } from './converters'
import { Presets } from './presets'
import { range, clone, mapValues } from 'lodash'
import { find_mapping } from './arciorgano_mapping'
import * as download from 'downloadjs'
import { boolean } from 'mathjs'

const presets = {
  'Mode1_meantone31': require('./presets/ArcOrg_mode1_meantone31.json'),
  'Mode2_1-4comma_adapted': require('./presets/ArcOrg_mode2_1-4comma_adapted.json'),
  'Mode3_Walter_pseudorein': require('./presets/ArcOrg_mode3_Walter_pseudorein.json'),
  'Mode4_Partch': require('./presets/ArcOrg_mode4_Partch.json'),
  'Mode4b_Partch2': require('./presets/ArcOrg_mode4b_Partch2.json'),
  'Mode5_EDO34': require('./presets/ArcOrg_mode5_EDO34.json'),
  'Mode6_1-3Comma_ad': require('./presets/ArcOrg_mode6_1-3Comma_ad.json'),
  'Mode7_Salinas24+12': require('./presets/ArcOrg_mode7_Salinas24+12.json'),
  'Mode8_Universal_quasi_limit7': require('./presets/ArcOrg_mode8_tuning_universal_quasi_limit7_g#=a442_RefPipe_Ab+.json')
}

const octaveLayoutS = [
  ' 0 0   X X X   ',
  ' 0 0   X X X   ',
  '0 0 0 X X X X X',
  ' X X X X X X X ',
  ' X X   X X X   ',
  'X X X X X X X X'
]

const octave0Disabled = octaveLayoutS.map((s) => {
  const chars = s.split('')
  return chars.map((c) => c === '0')
})

const octaveLayout = octaveLayoutS.map((s) => {
  const chars = s.split('')
  return chars.map((c) => c !== ' ')
})

let _idx = -1
const layoutIndex = octaveLayout.map((row) =>
  row.map((a) => {
    if (a) {
      _idx += 1
    }
    return _idx
  })
)


const normalLabels = [
  'des+', 'dis+', 'ges+', 'as+', 'ais+',
  'cis+', 'es+', 'fis+', 'gis+', 'b+',
  'c+', 'd+', 'e+', 'f+', 'g+', 'a+', 'h+', 'c+',
  'des', 'dis', 'eis', 'ges', 'as', 'ais', 'his',
  'cis', 'es', 'fis', 'gis', 'b',
  'c', 'd', 'e', 'f', 'g', 'a', 'h', 'c'
];

const partchLabels = [
  '8/5', '7/4', '16/15', '6/5', '9/7',
  '14/9', '9/5', '33/32', '8/7', '27/20',
  '3/2', '5/3', '11/6', '1/1', '11/10', '5/4', '7/5', '3/2',
  '11/7', '12/7', '15/8', '21/20', '7/6', '14/11', '10/7',
  '32/21', '16/9', '81/80', '9/8', '4/3',
  '16/11', '18/11', '20/11', '160/81', '12/11', '11/9', '11/8', '16/11'
];

const cesFesLabels = clone(normalLabels)
cesFesLabels[20] = 'fes'
cesFesLabels[24] = 'ces'

const partch2Labels = clone(partchLabels);
partch2Labels[2] = '15/14'
partch2Labels[7] = '21/20'
partch2Labels[9] = '4/3'
partch2Labels[14] = '10/9'
partch2Labels[21] = '16/15'
partch2Labels[27] = '33/32'
partch2Labels[29] = '21/16'
partch2Labels[33] = '64/33'

const layoutLabels = {
  normal: normalLabels,
  ces_fes: cesFesLabels,
  partch: partchLabels,
  partch2: partch2Labels,
}


interface State {
  octaves: number,
  rows: number,
  concertPitch: number,
  pitch11: number,
  data: (number | null)[],
  mode: 'ratio' | 'cents',
  muted: boolean,
  label: 'normal' | 'partch' | 'partch2' | 'ces_fes'
}

interface Preset {
  concertPitch: string,
  pitch11: string,
  data: string[],
  rows: number | undefined,
  mode: 'ratio' | 'cents',
  label: 'normal' | 'partch' | 'partch2' | 'ces_fes',
  octaves: number
}

interface SequenceEntry {
  playing: { [octave: number]: { [idx: number]: boolean } }
  length?: number,
  overlap?: number,
}



interface SequenceEditorProps {
  saveData: (i: number) => SequenceEntry,
  load: (save: SequenceEntry) => void,
}
interface SequenceEditorState {
  saves: (SequenceEntry | null)[],
  isPlaying?: boolean,
  progress?: number
}

class SequenceEditor extends React.PureComponent<SequenceEditorProps, SequenceEditorState> {
  private lengthInputs: { [key: number]: MathInput } = {}
  private overlapInputs: { [key: number]: MathInput } = {}
  private startTimer?: number
  private stopTimer?: number
  private sequenceActive: { [key: number]: boolean } = {}
  constructor(props: SequenceEditorProps) {
    super(props)
    this.state = {
      saves: new Array(4).fill(null),
      isPlaying: false,
    }
  }

  load(saves: (SequenceEntry | null)[]) {
    this.setState({ saves })
    saves.forEach((save, i) => {
      this.lengthInputs[i]?.setValue(save?.length || 1000)
      this.overlapInputs[i]?.setValue(save?.overlap || 0)
    })
  }

  onClickPlay() {
    if (this.startTimer !== undefined)
      clearTimeout(this.startTimer)
    this.startTimer = undefined

    if (this.stopTimer !== undefined)
      clearTimeout(this.stopTimer)
    this.stopTimer = undefined

    this.sequenceActive = {}
    if (this.state.isPlaying) {
      this.setState({ isPlaying: false })
      this.pushState()
    } else {
      this.advance(0)
    }
  }

  advance(idx: number) {
    this.sequenceActive[idx] = true
    this.pushState()
    const hasNext = idx < this.state.saves.length && this.state.saves[idx + 1] !== null
    const length = this.state.saves[idx]?.length || 1000
    const overlap = this.state.saves[idx]?.overlap || 0
    this.stopTimer = setTimeout(() => {
      this.sequenceActive[idx] = false
      if (overlap !== 0 || !hasNext)
        this.pushState()
    }, length + overlap) as unknown as number
    if (hasNext)
      this.startTimer = setTimeout(() => this.advance(idx + 1), length) as unknown as number
    this.setState({
      isPlaying: hasNext
    })
  }

  pushState() {
    const playing: { [octave: number]: { [idx: number]: boolean } } = {}
    // Object.entries stringifies key :/
    for (const [_i, saveActive] of Object.entries(this.sequenceActive)) {
      const _playing = this.state.saves[parseInt(_i, 10)]
      if (_playing !== null) {
        for (const [_j, octave] of Object.entries(_playing.playing)) {
          const j = parseInt(_j, 10)
          if (playing[j] === undefined)
            playing[j] = {}
          for (const [_k, active] of Object.entries(octave)) {
            const k = parseInt(_k, 10)
            playing[j][k] = (saveActive && active) || playing[j][k]
          }
        }
      }
    }
    this.props.load({ playing })
  }

  render() {
    const style = { background: this.state.isPlaying ? "#f15f55" : "#2196f3" };
    return (
      <table>
        <tbody>
          <tr>
            <th>Sequence Editor</th>
            {this.state.saves.map((_: (SequenceEntry | null), i: number) => (
              <th key={i} style={{ padding: '8px' }}>
                <button
                  onClick={() => {
                    const save = this.props.saveData(i)
                    const saves = [...this.state.saves];
                    saves[i] = save
                    if (i === saves.length - 1) {
                      saves.push(null);
                    }
                    this.setState({ saves })
                  }}
                  style={{ padding: '8px' }}
                >Save {i + 1}</button>
              </th>
            ))}
          </tr>
          <tr>
            <th>
              <button style={style} onClick={() => this.onClickPlay()} disabled={this.state.saves[0] === null}>
                Play Sequence
              </button>
            </th>
            {this.state.saves.map((data: (SequenceEntry | null), i: number) => (
              <th key={i} style={{ padding: '8px' }}>
                <button
                  disabled={!data}
                  onClick={() => this.props.load(data!)}
                  style={{ padding: '8px' }}
                >Load {i + 1}</button>
              </th>
            ))}
          </tr>
          <tr>
            <th>Length</th>
            {this.state.saves.map((_, i) => <td key={i}>
              <MathInput size={3.35}
                disabled={!this.state.saves[i]}
                default='1000'
                onChange={(v) => {
                  const saves = clone(this.state.saves)
                  saves[i]!.length = v
                  this.setState({ saves })
                }} ref={(ref) => {
                  if (ref) this.lengthInputs[i] = ref
                }} />
            </td>)}
          </tr>
          <tr>
            <th>Overlap</th>
            {this.state.saves.map((_, i) => <td key={i}>
              <MathInput size={3.35}
                disabled={!this.state.saves[i]}
                default='0'
                onChange={(v) => {
                  const saves = clone(this.state.saves)
                  saves[i]!.overlap = v
                  this.setState({ saves })
                }} ref={(ref) => {
                  if (ref) this.overlapInputs[i] = ref
                }} />
            </td>)}
          </tr>
        </tbody>
      </table>
    )
  }
}


// tslint:disable-next-line: max-classes-per-file
export class ArciorganoPlayer extends React.PureComponent<{}, State> {
  private players: { [octave: number]: { [idx: number]: CompactFrequencyPlayer } }
  private inputs: MathInput[]
  private concertPitch?: MathInput
  private pitch11?: MathInput
  private sequenceEditor?: SequenceEditor

  constructor(props: {}) {
    super(props)
    this.state = {
      octaves: 1,
      rows: 8,
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(38).fill(null),
      mode: 'ratio',
      muted: false,
      label: 'normal'
    }
    this.players = {}
    this.inputs = []
  }

  onPreset(name: string, preset: Preset) {
    if (this.concertPitch)
      this.concertPitch.setValue(preset.concertPitch, true)
    if (this.pitch11)
      this.pitch11.setValue(preset.pitch11, true)
    if (preset.data.length === 37) {
      // index 17 is missing...
      // compat w/ old presets
      const other = preset.data.splice(17, 37)
      preset.data.push('')
      preset.data = preset.data.concat(other)
    }
    const data = this.inputs.map((input, i) => {
      input.setValue(preset.data[i])
      return evalMathN(preset.data[i])
    })
    this.setState({
      mode: preset.mode,
      label: preset.label || 'normal',
      octaves: preset.octaves,
      data
    })
  }

  dumpPreset() {
    return {
      octaves: this.state.octaves,
      mode: this.state.mode,
      label: this.state.label,
      rows: this.state.rows,
      concertPitch: this.concertPitch!.text(),
      pitch11: this.pitch11!.text(),
      data: this.inputs.map((i) => i.text())
    }
  }

  _setPlayerRef(octave: number, index: number, ref: CompactFrequencyPlayer | null) {
    if (ref === null) return
    if (!this.players[octave])
      this.players[octave] = {}
    this.players[octave][index] = ref
  }

  renderElement(index: number, small: boolean, disabled: boolean, octave: number) {
    const data = this.state.data[index]
    const muted = this.state.muted || disabled
    let freq: number | undefined
    if (data !== null) {
      freq = {
        ratio: (pitch: number, r: number) => pitch * r,
        cents: (pitch: number, r: number) => pitch * Math.pow(2, r / 1200)
      }[this.state.mode](this.state.pitch11, data)
    }
    return (
      <div>
        <MathInput size={small ? 3.35 : 4.25} default=''
          onChange={(v) => {
            const newData = clone(this.state.data)
            newData[index] = v
            this.setState({ data: newData })
          }} ref={(ref) => {
            if (ref) this.inputs[index] = ref
          }} />
        <CompactFrequencyPlayer freq={freq} muted={muted}
          text={layoutLabels[this.state.label][index]} ref={(ref) => this._setPlayerRef(octave, index, ref)}
          buttonStyle={small ? { padding: '.5em', width: '100%' } : { width: '100%' }} />
      </div>
    )
  }

  mechanicalArciCode() {
    const saves = this.sequenceEditor!.state.saves
    let lines = ""
    for (const save of saves) {
      if (save) {
        const line = []
        for (const [_octave, keys] of Object.entries(save.playing)) {
          const octave = parseInt(_octave, 10)
          for (const [_key, active] of Object.entries(keys)) {
            const key = parseInt(_key, 10)
            if (active) {
              line.push(find_mapping(octave, key))
            }
          }
        }
        lines += `${save.length || 1000} ${save.overlap || 0} ${line.join(' ')}\n`
      }
    }
    return lines
  }

  render() {
    const c0 = concertPitchToC0(this.state.concertPitch)
    const cents = ratioToCents(this.state.pitch11 / c0)

    this.players = new Array(this.state.rows).fill(null)
    this.inputs = new Array(this.state.rows).fill(null)
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
                  }} ref={(e) => { if (e) this.concertPitch = e }} />
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
                  const mode = e.target.value
                  if (mode === 'ratio' || mode === 'cents')
                    this.setState({ mode })
                }} value={this.state.mode}>
                  <option value="ratio">Ratio</option>
                  <option value="cents">Cents</option>
                </select>
              </th>
              <th>Note Label</th>
              <th>
                <select onChange={(e) => {
                  const label = e.target.value
                  if (label === 'normal' || label === 'ces_fes' || label === 'partch' || label === 'partch2')
                    this.setState({ label })
                }} value={this.state.label}>
                  <option value="normal">Normal</option>
                  <option value="ces_fes">Normal (ces/fes)</option>
                  <option value="partch">Partch</option>
                  <option value="partch2">Partch 2</option>
                </select>
              </th>
            </tr>
            <tr>
              <th>Octaves</th>
              <th>
                <input type="number"
                  min="1" max="4" value={this.state.octaves}
                  style={{ width: '3em' }}
                  onChange={(event) => {
                    const octaves = parseInt(event.target.value, 10)
                    this.setState({ octaves })
                  }} />
              </th>
            </tr>
            <Presets name='arciorganoPlayerPresets' label='Tuning Preset' default={{
              concertPitch: '440',
              pitch11: '440 / 9 * 8',
              label: 'partch',
              octaves: 4,
              rows: 8,
              mode: 'ratio',
              data: range(38).map(() => '')
            }}
              onChange={this.onPreset.bind(this)}
              presets={presets}
              current={this.dumpPreset.bind(this)} />
            <tr>
              <th>Mute</th>
              <th>
                <button onClick={() => {
                  this.setState({ muted: !this.state.muted })
                }}>{this.state.muted ? 'un' : ''}mute</button>
              </th>
            </tr>
            <Presets name='arciorganoSavePresets' label='Music Preset'
              default={{ saves: [null, null, null, null], isPlaying: false }} newAsDefault
              onChange={(_, state) => this.sequenceEditor && this.sequenceEditor.load(state.saves)}
              current={() => (this.sequenceEditor && this.sequenceEditor.state) || { saves: [] }} />
            <tr>
              <th>Mechanical Arciorgano Code</th>
              <th>
                <button onClick={() => {
                  download(this.mechanicalArciCode(), "code.txt")
                }}>
                  Export/Download
                </button>
              </th>
            </tr>
          </tbody>
        </table>
        <SequenceEditor
          load={(save) => {
            for (const [_octave, players] of Object.entries(this.players)) {
              const octave = parseInt(_octave, 10)
              if (players)
                for (const [_i, player] of Object.entries(players)) {
                  const i = parseInt(_i, 10)
                  if (player) player.setPlaying(save.playing && save.playing[octave] && save.playing[octave][i])
                }
            }
          }}
          saveData={() => {
            return {
              playing: mapValues(this.players, octave => mapValues(octave, player => player.state.isPlaying))
            }
          }}
          ref={(e: SequenceEditor) => { if (e) this.sequenceEditor = e }}
        />

        {range(this.state.octaves - 1, 0, -1).map((oc) =>
          <div key={oc}>
            <h3>Octave {oc + 2}</h3>
            <table>
              <tbody>
                {octaveLayout.map((row, rowi) =>
                  <tr key={rowi}>
                    {row.map((isThing, i) => {
                      if (isThing) {
                        const small = (rowi !== 2) && (rowi !== 5)
                        const index = layoutIndex[rowi][i]
                        const data = this.state.data[index]
                        if (data === null) { return }
                        const freq = {
                          ratio: (pitch: number, r: number) => pitch * r * Math.pow(2, oc),
                          cents: (pitch: number, r: number) => pitch * Math.pow(2, r / 1200 + oc)
                        }[this.state.mode](this.state.pitch11, data)
                        const disabled = (oc + 2 === 5) && normalLabels[index] === 'his'
                        return (
                          <td key={i} style={{ padding: '0' }}>
                            <CompactFrequencyPlayer freq={freq}
                              buttonStyle={small ? { padding: '.5em', width: '3.35em' } : { width: '4.25em' }}
                              text={layoutLabels[this.state.label][index]} muted={this.state.muted || disabled}
                              ref={(ref) => this._setPlayerRef(oc, index, ref)} />
                          </td>
                        )
                      } else {
                        return <td key={i} style={{ padding: '0' }} />
                      }
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <h3>Octave 2</h3>
        <table>
          <tbody>
            {octaveLayout.map((row, rowi) => {
              return (
                <tr key={rowi}>
                  {row.map((isThing, i) => {
                    return (
                      <td key={i} style={{ padding: '0px' }}>
                        {
                          isThing
                            ? this.renderElement(layoutIndex[rowi][i], (rowi !== 2) && (rowi !== 5), octave0Disabled[rowi][i], 0)
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
      </div>
    )
  }
}
