import React, {Component} from 'react'
import math from 'mathjs'

import {RequiresJS, MathInput, FreqPlayer, SpecificRangeSlider} from './components.jsx'

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
      }
    }
  }

  render () {
    let freq1 = this.state.freq1.value || 440
    let freq2 = this.state.freq2.value || 550
    let smaller = math.min(freq1, freq2)
    let bigger = math.max(freq1, freq2)
    let error = this.state.freq1.error || this.state.freq2.error
    return (
      <div>
        <RequiresJS />
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
            <FreqPlayer defaultVolume={0.8} showTypePicker inTable freq={freq1} />
            <FreqPlayer defaultVolume={0.8} showTypePicker inTable freq={freq2} />
            <FreqPlayer defaultVolume={0.5} showTypePicker inTable freq={bigger - smaller} />
            <FreqPlayer defaultVolume={0.3} showTypePicker inTable freq={math.abs(smaller * 2 - bigger)} />
          </tbody>
        </table>
      </div>
    )
  }
}
