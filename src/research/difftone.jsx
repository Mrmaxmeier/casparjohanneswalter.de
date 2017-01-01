import React, {Component} from 'react'
import { min, max, abs } from 'mathjs'

import {MathInput, FreqPlayer, SpecificRangeSlider} from './components.jsx'

export class DiffTone extends Component {
  constructor (props) {
    super(props)
    this.state = {
      freq1: {
        value: 440,
        error: null
      },
      freq2: {
        value: 550,
        error: null
      },
      inverted: false
    }
  }

  render () {
    let freq1 = this.state.freq1.value || 440
    let freq2 = this.state.freq2.value || 550
    let smaller = min(freq1, freq2)
    let bigger = max(freq1, freq2)
    let error = this.state.freq1.error || this.state.freq2.error
    let val = this.state.inverted ? (v) => (1 / v) * freq1 * freq2 : (v) => v
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Freq 1</th>
              <th>
                <MathInput default={440}
                  wide asKind="mathjs"
                  onChange={(freq1) => {
                    this.setState({freq1})
                    this.refs.slider1.setValue(freq1.value)
                  }} ref="input1" />
              </th>
              <th>
                <SpecificRangeSlider defaultMin={400} defaultMax={600} onChange={(value) => {
                  this.setState({freq1: {value, error: null}})
                  this.refs.input1.setValue(value)
                }} ref="slider1" />
              </th>
            </tr>
            <tr>
              <th>Freq 2</th>
              <th>
                <MathInput default={550}
                  wide asKind="mathjs"
                  onChange={(freq2) => {
                    this.setState({freq2})
                    this.refs.slider2.setValue(freq2.value)
                  }} ref="input2" />
              </th>
              <th>
                <SpecificRangeSlider defaultMin={400} defaultMax={600} onChange={(value) => {
                  this.setState({freq2: {value, error: null}})
                  this.refs.input2.setValue(value)
                }} ref="slider2" />
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
            {error ? (
              <tr style={{color: 'red'}}>
                <th>Error</th>
                <th>{error.toString()}</th>
              </tr>
            ) : null}
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
