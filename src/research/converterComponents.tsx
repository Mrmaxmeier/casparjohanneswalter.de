import React, { PureComponent } from 'react'
import { MathInput, FreqPlayer, PrecNumber, NoteDisplay } from './components'
import { ratioToCents, concertPitchToC0 } from './converters.js'

export class FractionToCents extends PureComponent {
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
        <h4>Fraction to cents</h4>
        <p>Converts numbers zu cents
          (<a onClick={() => { this.input.setValue('5 / 4', true) }}>try 5 / 4</a>)
        </p>
        <table>
          <tbody>
            <tr>
              <th>Ratio</th>
              <th>
                <MathInput
                  wide asKind="mathjs" ref={(e) => { this.input = e }}
                  onChange={(input) => { this.setState({input}) }} />
              </th>
            </tr>
            <tr>
              <th>Freq for 1:1 (hz)</th>
              <th>
                <MathInput default={440}
                  wide asKind="mathjs"
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
              {playerFrequencies.map((freq) => <FreqPlayer showTypePicker={false} inTable freq={freq} key={freq} />)}
            </tbody>
          </table>
        ) : null}
      </div>
    )
  }
}

export class FrequencyToPitch extends PureComponent {
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
    let input = this.state.input.value || 220
    let reference = this.state.reference.value || 440
    let error = this.state.input.error || this.state.reference.error
    let canRender = this.state.input.value !== null && this.state.input.value !== undefined
    let c0 = concertPitchToC0(reference)
    let cents = ratioToCents(input / c0)

    return (
      <div>
        <h4>Frequency to pitch</h4>
        <p>Converts frequencies to pitch
          (<a onClick={() => { this.input.setValue('220', true) }}>try 220</a>)
        </p>
        <table>
          <tbody>
            <tr>
              <th>A4 (hz)</th>
              <th>
                <MathInput default={440}
                  wide asKind="mathjs"
                  onChange={(reference) => { this.setState({reference}) }} />
              </th>
            </tr>
            <tr>
              <th>Frequency</th>
              <th>
                <MathInput
                  wide asKind="mathjs" ref={(e) => { this.input = e }}
                  onChange={(input) => { this.setState({input}) }} />
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
                <th>Pitch</th>
                <th>
                  <NoteDisplay cents={cents} />
                </th>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    )
  }
}
