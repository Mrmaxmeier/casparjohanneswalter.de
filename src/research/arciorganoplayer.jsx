import React, {PureComponent} from 'react'

import { MathInput, NoteDisplay, NoteImage, CompactFrequencyPlayer } from './components.jsx'
import { concertPitchToC0, ratioToCents } from './converters.js'
import { Presets } from './presets.jsx'
import { range } from 'underscore'
import { clone } from 'underline'

let octaveLayout = [
  ' X X   X X X   ',
  ' X X   X X X   ',
  'X X X X X X X  ',
  ' X X X X X X X ',
  ' X X   X X X   ',
  'X X X X X X X X'
].map((s) => {
  let chars = s.split('')
  return chars.map((c) => c === 'X')
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

let layoutLabels = {
  normal: [
    'des+', 'dis+', 'ges+', 'as+', 'ais+',
    'cis+', 'es+', 'fis+', 'gis+', 'b+',
    'c+', 'd+', 'e+', 'f+', 'g+', 'a+', 'h+',
    'des', 'dis', 'eis', 'ges', 'as', 'ais', 'his',
    'cis', 'es', 'fis', 'gis', 'b',
    'c', 'd', 'e', 'f', 'g', 'a', 'h', 'c'
  ],
  partch: [
    '8/5', '7/4', '16/15', '6/5', '9/7',
    '14/9', '9/5', '33/32', '8/7', '27/20',
    '3/2', '5/3', '11/6', '1/1', '11/10', '5/4', '7/5',
    '11/7', '12/7', '15/7', '21/20', '7/6', '14/11', '10/7',
    '32/21', '16/9', '81/80', '9/8', '4/3',
    '16/11', '18/11', '20/11', '160/81', '12/11', '11/9', '11/8', '16/11'
  ]
}

export class ArciorganoPlayer extends PureComponent {
  constructor (props) {
    super(props)
    let octaves = 1
    this.state = {
      octaves,
      concertPitch: 440,
      pitch11: 440 / 9 * 8,
      data: new Array(37).fill(null),
      mode: 'ratio',
      muted: false,
      label: 'normal'
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

  onPreset (name, preset) {
    this.refs.concertPitch.setValue(preset.concertPitch, true)
    this.refs.pitch11.setValue(preset.pitch11, true)
    let data = this.inputs.map((input, i) => {
      let result = input.calc(preset.data[i])
      input.setValue(preset.data[i])
      return result.value
    })
    this.setState({
      mode: preset.mode,
      label: preset.label || 'normal',
      data
    })
  }

  dumpPreset () {
    return {
      octaves: this.state.octaves,
      mode: this.state.mode,
      label: this.state.label,
      concertPitch: this.refs.concertPitch.text(),
      pitch11: this.refs.pitch11.text(),
      data: this.inputs.map((i) => i.text())
    }
  }

  renderElement (index, small) {
    let freq = {
      ratio: (pitch, r) => pitch * r,
      cents: (pitch, r) => pitch * Math.pow(2, r / 1200)
    }[this.state.mode](this.state.pitch11, this.state.data[index])
    return (
      <div>
        <MathInput size={small ? 3.15 : 3.95} asKind="mathjs" default=''
          onChange={(v) => {
            console.log(v.value)
            let data = this.state.data::clone()
            data[index] = v.value
            this.setState({ data })
          }} ref={(ref) => {
            this.inputs[index] = ref
          }} />
        <CompactFrequencyPlayer freq={freq} muted={this.state.muted}
          text={layoutLabels[this.state.label][index]} ref={(ref) => {
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
              <th>Note Label</th>
              <th>
                <select onChange={(e) => {
                  this.setState({ label: e.target.value })
                }} value={this.state.label}>
                  <option value="normal">Normal</option>
                  <option value="partch">Partch</option>
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
            <Presets name='arciorganoPlayerPresets' default={{
              concertPitch: '440',
              pitch11: '440 / 9 * 8',
              rows: 8,
              mode: 'ratio',
              data: range(37).map(() => '')
            }} ref='presets' onChange={this.onPreset.bind(this)}
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
            <h3>Octave {oc}</h3>
            <table>
              <tbody>
                {octaveLayout.map((row, rowi) =>
                  <tr key={rowi}>
                    {row.map((isThing, i) => {
                      if (isThing) {
                        let small = (rowi !== 2) && (rowi !== 5)
                        let index = layoutIndex[rowi][i]
                        let freq = {
                          ratio: (pitch, r) => pitch * r * Math.pow(2, oc),
                          cents: (pitch, r) => pitch * Math.pow(2, r / 1200 + oc)
                        }[this.state.mode](this.state.pitch11, this.state.data[index])
                        return (
                          <th key={i} style={{padding: '0'}}>
                            <CompactFrequencyPlayer freq={freq}
                              buttonStyle={small ? {padding: '.5em', width: '3.15em'} : {width: '3.95em'}}
                              text={layoutLabels[this.state.label][index]} muted={this.state.muted} />
                          </th>
                        )
                      } else {
                        return <th key={i} style={{padding: '0'}} />
                      }
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <h3>Octave 0</h3>
        <table>
          <tbody>
            {octaveLayout.map((row, rowi) => {
              return (
                <tr key={rowi}>
                  {row.map((isThing, i) => {
                    return (
                      <th key={i} style={{padding: '0px'}}>
                        {
                          isThing
                          ? this.renderElement(layoutIndex[rowi][i], (rowi !== 2) && (rowi !== 5))
                          : null
                        }
                      </th>
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
