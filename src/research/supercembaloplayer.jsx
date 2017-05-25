import React, {PureComponent} from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components.jsx'
import { concertPitchToC0, ratioToCents } from './converters.js'
import { Presets } from './presets.jsx'
import { range } from 'underscore'
import { clone } from 'underline'

let octaveLayout = [
  ' X X X X X X X ',
  ' X X X X X X X ',
  ' X X   X X X   ',
  ' X X   X X X   ',
  'X X X X X X X X',
  ' X X X X X X X ',
  ' X X   X X X   ',
  ' X X   X X X   ',
  'X X X X X X X X'
]

octaveLayout = octaveLayout.map((s) => {
  let chars = s.split('')
  return chars.map((c) => c !== ' ')
})

let _idx = -1
let layoutIndex = octaveLayout.map((row) =>
  row.map((a) => {
    if (a) {
      _idx += 1
    }
    return _idx
  })
)

let layoutLabels = [
  2, 16, 19, 24, 33, 47, 50,
  7, 10, 21, 30, 38, 41, 52,
  6, 11, 28, 37, 43,
  4, 13, 26, 35, 45,
  1, 9, 18, 23, 32, 40, 49, 1,
  6, 15, 20, 29, 37, 46, 51,
  5, 12, 27, 36, 42,
  3, 14, 25, 34, 44,
  0, 8, 17, 22, 31, 39, 48, 0
]
const presets = {
  'EDO 53': {
    octaves: 4,
    mode: 'ratio',
    concertPitch: '440',
    pitch11: '440 / 27 * 2',
    data: layoutLabels.map((v) => `2^(${v}/53)`)
  }
}
presets['EDO 53'].data[31] = '2^(54/53)'
presets['EDO 53'].data[56] = '2^(53/53)'

export class SuperCembaloPlayer extends PureComponent {
  constructor (props) {
    super(props)
    let octaves = 1
    this.state = {
      octaves,
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(38).fill(null),
      mode: 'ratio',
      muted: false
    }
    this.players = []
    this.inputs = []
  }

  onPreset (name, preset) {
    this.concertPitch.setValue(preset.concertPitch, true)
    this.pitch11.setValue(preset.pitch11, true)
    let data = this.inputs.map((input, i) => {
      let result = input.calc(preset.data[i])
      input.setValue(preset.data[i])
      return result.value
    })
    this.setState({
      mode: preset.mode,
      octaves: preset.octaves,
      data
    })
  }

  dumpPreset () {
    return {
      octaves: this.state.octaves,
      mode: this.state.mode,
      concertPitch: this.concertPitch.text(),
      pitch11: this.pitch11.text(),
      data: this.inputs.map((i) => i.text())
    }
  }

  renderElement (index, small) {
    let freq = {
      ratio: (pitch, r) => pitch * r,
      cents: (pitch, r) => pitch * Math.pow(2, r / 1200)
    }[this.state.mode](this.state.pitch11, this.state.data[index])
    let muted = this.state.muted
    return (
      <div>
        <MathInput size={small ? 3.15 : 3.95} asKind="mathjs" default=''
          onChange={(v) => {
            let data = this.state.data::clone()
            data[index] = v.value
            this.setState({ data })
          }} ref={(ref) => {
            this.inputs[index] = ref
          }} />
        <CompactFrequencyPlayer freq={freq} muted={muted}
          text={'' + layoutLabels[index]} ref={(ref) => {
            this.players[index] = ref
          }} buttonStyle={small ? {padding: '.5em', width: '100%'} : {width: '100%'}} />
      </div>
    )
  }

  render () {
    let c0 = concertPitchToC0(this.state.concertPitch)
    let cents = ratioToCents(this.state.pitch11 / c0)

    this.players = range(this.state.rows).fill(null)
    this.inputs = range(this.state.rows).fill(null)
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
                  }} ref={(e) => { this.concertPitch = e }}/>
              </th>
            </tr>
            <tr>
              <th>Pitch 1 / 1</th>
              <th>
                <MathInput
                  wide asKind="mathjs-ignoreerror" default="440 / 9 * 8"
                  onChange={(pitch11) => {
                    this.setState({ pitch11 })
                  }} ref={(e) => { this.pitch11 = e }} />
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
              <th>Octaves</th>
              <th>
                <input type="number"
                  min="1" max="4" value={this.state.octaves}
                  style={{width: '3em'}}
                  onChange={(event) => {
                    let octaves = parseInt(event.target.value)
                    this.setState({ octaves })
                  }}/>
              </th>
            </tr>
            <Presets name='superCembaloPlayerPresets' default={{
              concertPitch: '440',
              pitch11: '440 / 9 * 8',
              rows: 8,
              mode: 'ratio',
              data: range(38).map(() => '')
            }} onChange={this.onPreset.bind(this)}
              presets={presets}
              current={this.dumpPreset.bind(this)} />
            <tr>
              <th>Mute</th>
              <th>
                <button onClick={() => {
                  this.setState({muted: !this.state.muted})
                }}>{this.state.muted ? 'un' : ''}mute</button>
              </th>
            </tr>
          </tbody>
        </table>

        {range(this.state.octaves - 1, 0, -1).map((oc) =>
          <div key={oc}>
            <h3>Octave {oc + 2}</h3>
            <table>
              <tbody>
                {octaveLayout.map((row, rowi) =>
                  <tr key={rowi}>
                    {row.map((isThing, i) => {
                      if (isThing) {
                        let small = (rowi !== 4) && (rowi !== 8)
                        let index = layoutIndex[rowi][i]
                        let freq = {
                          ratio: (pitch, r) => pitch * r * Math.pow(2, oc),
                          cents: (pitch, r) => pitch * Math.pow(2, r / 1200 + oc)
                        }[this.state.mode](this.state.pitch11, this.state.data[index])
                        return (
                          <td key={i} style={{padding: '0'}}>
                            <CompactFrequencyPlayer freq={freq}
                              buttonStyle={small ? {padding: '.5em', width: '3.15em'} : {width: '3.95em'}}
                              text={'' + layoutLabels[index]} muted={this.state.muted} />
                          </td>
                        )
                      } else {
                        return <td key={i} style={{padding: '0'}} />
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
                      <td key={i} style={{padding: '0px'}}>
                        {
                          isThing
                          ? this.renderElement(layoutIndex[rowi][i], (rowi !== 4) && (rowi !== 8))
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
