import React, { Component } from 'react'
import { MathInput, FreqPlayer, PrecNumber, RequiresJS } from './components.jsx'
import { ratioToCents } from './converters.js'

export class FractionToCents extends Component {
  constructor (props) {
    super(props)
    this.state = {
      input: {
        value: null,
        error: null
      },
      reference: {
        value: 440,
        error: null
      }
    }
  }
  render () {
    let value = this.state.input.value
    let error = this.state.input.error
    let canRender = value !== null && value !== undefined
    let output = canRender ? ratioToCents(value) : null
    let playerFrequencies = canRender ? [
      this.state.reference.value,
      this.state.reference.value * value
    ] : []
    return (
      <div>
        <RequiresJS />
        <h4>Fraction to cents</h4>
        <p>Converts numbers zu cents
          (<a onClick={() => { this.refs.input.set('5 / 4') }}>try 5 / 4</a>)
        </p>
        <table>
          <tbody>
            <tr>
              <th>Ratio</th>
              <th>
                <MathInput
                  wide asKind="mathjs" ref="input"
                  onChange={(input) => { this.setState({input}) }} />
              </th>
            </tr>
            <tr>
              <th>Freq for 1:1 (hz)</th>
              <th>
                <MathInput default={440}
                  wide asKind="mathjs" ref="reference"
                  onChange={(reference) => { this.setState({reference}) }} />
              </th>
            </tr>
            {error ? (
              <tr style={{color: 'red'}}>
                <th>Error</th>
                <th>{error.toString()}</th>
              </tr>
            ) : null}
            {canRender ? (
              <tr>
                <th>Cents</th>
                <th><PrecNumber value={output} /></th>
              </tr>
            ) : null}
          </tbody>
        </table>
        {canRender ? (
          <table>
            <tbody>
              {playerFrequencies.map((freq) => <FreqPlayer inTable freq={freq} key={freq} />)}
            </tbody>
          </table>
        ) : null}
      </div>
    )
  }
}
