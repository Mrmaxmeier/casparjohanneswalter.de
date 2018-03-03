import * as React from 'react'
import { min, max, abs } from 'mathjs'

import { MathInput, FreqPlayer, SpecificRangeSlider } from './components'
import { AudioController, AudioControllerRow } from './audioComponents'

interface State {
  freq1: number,
  freq2: number,
  inverted: boolean
}

export class DiffTone extends React.PureComponent<{}, State> {
  private input1?: MathInput
  private slider1?: SpecificRangeSlider
  private input2?: MathInput
  private slider2?: SpecificRangeSlider

  constructor (props: {}) {
    super(props)
    this.state = {
      freq1: 440,
      freq2: 550,
      inverted: false
    }
  }

  render () {
    let freq1 = this.state.freq1
    let freq2 = this.state.freq2
    let smaller = min(freq1, freq2)
    let bigger = max(freq1, freq2)
    let val = this.state.inverted ? (v: number) => (1 / v) * freq1 * freq2 : (v: number) => v
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Freq 1</th>
              <th>
                <MathInput default={440} wide
                  onChange={(freq1) => {
                    this.setState({ freq1 })
                    if (this.slider1)
                      this.slider1.setValue(freq1)
                  }} ref={(e) => { if (e) this.input1 = e }} />
              </th>
              <th>
                <SpecificRangeSlider defaultMin={400} defaultMax={600} onChange={(value) => {
                  this.setState({ freq1: value })
                  if (this.input1)
                    this.input1.setValue(value)
                }} ref={(e) => { if (e) this.slider1 = e }} />
              </th>
            </tr>
            <tr>
              <th>Freq 2</th>
              <th>
                <MathInput default={550}
                  wide
                  onChange={(freq2) => {
                    this.setState({ freq2 })
                    if (this.slider2)
                      this.slider2.setValue(freq2)
                  }} ref={(e) => { if (e) this.input2 = e }} />
              </th>
              <th>
                <SpecificRangeSlider defaultMin={400} defaultMax={600} onChange={(value) => {
                  this.setState({ freq2: value })
                  if (this.input2)
                    this.input2.setValue(value)
                }} ref={(e) => { if (e) this.slider2 = e }} />
              </th>
            </tr>
            <tr>
              <th>Normal</th>
              <th>
                <input type="radio" name="inverted" checked={!this.state.inverted} onChange={(event) => {
                  this.setState({ inverted: false })
                }} style={{width: '1em', height: '1em'}} />
              </th>
              <th>
                Otonality
              </th>
            </tr>
            <tr>
              <th>Inverted</th>
              <th>
                <input type="radio" name="inverted" checked={this.state.inverted} onChange={(event) => {
                  this.setState({ inverted: true })
                }} style={{width: '1em', height: '1em'}} />
              </th>
              <th>
                Utonality, intervallic inversion
              </th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            <FreqPlayer text="Sum:" defaultVolume={0.5} showTypePicker inTable freq={val(freq1 + freq2)} />
            <FreqPlayer text="Freq 1:" defaultVolume={0.8} showTypePicker inTable freq={val(freq1)} />
            <FreqPlayer text="Freq 2:" defaultVolume={0.8} showTypePicker inTable freq={val(freq2)} />
            <FreqPlayer text="Diff 1:" defaultVolume={0.5} showTypePicker inTable freq={val(bigger - smaller)} />
            <FreqPlayer text="Diff 2:" defaultVolume={0.3} showTypePicker inTable freq={val(abs(smaller * 2 - bigger))} />
          </tbody>
        </table>
      </div>
    )
  }
}
