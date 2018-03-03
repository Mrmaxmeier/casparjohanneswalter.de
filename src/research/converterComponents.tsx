import * as React from 'react'
import { MathInput, FreqPlayer, PrecNumber, NoteDisplay } from './components'
import { ratioToCents, concertPitchToC0 } from './converters'

interface FractionToCentsState {
  input: number,
  reference: number
}

export class FractionToCents extends React.PureComponent<{}, FractionToCentsState> {
  private input?: MathInput
  constructor (props: {}) {
    super(props)
    this.state = {
      input: 5 / 4,
      reference: 440,
    }
  }
  render () {
    let output = ratioToCents(this.state.input)

    let playerFrequencies = [
      this.state.reference,
      this.state.reference * this.state.input
    ]
    if (this.state.input === 1) { playerFrequencies.pop() }
    return (
      <div>
        <h4>Fraction to cents</h4>
        <p>Converts numbers zu cents
          (<a onClick={() => { if (this.input) this.input.setValue('5 / 4', true) }}>try 5 / 4</a>)
        </p>
        <table>
          <tbody>
            <tr>
              <th>Ratio</th>
              <th>
                <MathInput
                  wide ref={(e) => { if (e) this.input = e }}
                  onChange={(input) => { this.setState({input}) }} />
              </th>
            </tr>
            <tr>
              <th>Freq for 1:1 (hz)</th>
              <th>
                <MathInput default={440}
                  wide
                  onChange={(reference) => { this.setState({reference}) }} />
              </th>
            </tr>
            <tr>
              <th>Cents</th>
              <th>{output ? <PrecNumber value={output} /> : null}</th>
            </tr>
          </tbody>
        </table>
        <table>
          <tbody>
            {playerFrequencies.map((freq) => <FreqPlayer showTypePicker={false} inTable freq={freq} key={freq} />)}
          </tbody>
        </table>
      </div>
    )
  }
}

interface FrequencyToPitchState {
  input: number,
  reference: number
}

export class FrequencyToPitch extends React.PureComponent<{}, FrequencyToPitchState> {
  private input?: MathInput
  constructor (props: {}) {
    super(props)
    this.state = {
      input: 220,
      reference: 440
    }
  }
  render () {
    let input = this.state.input
    let reference = this.state.reference
    let c0 = concertPitchToC0(reference)
    let cents = ratioToCents(input / c0)

    return (
      <div>
        <h4>Frequency to pitch</h4>
        <p>Converts frequencies to pitch
          (<a onClick={() => { if (this.input) this.input.setValue('220', true) }}>try 220</a>)
        </p>
        <table>
          <tbody>
            <tr>
              <th>A4 (hz)</th>
              <th>
                <MathInput default={440}
                  wide
                  onChange={(reference) => { this.setState({reference}) }} />
              </th>
            </tr>
            <tr>
              <th>Frequency</th>
              <th>
                <MathInput
                  wide ref={(e) => { if (e) this.input = e }}
                  onChange={(input) => { this.setState({input}) }} />
              </th>
            </tr>
            <tr>
              <th>Pitch</th>
              <th>
                <NoteDisplay cents={cents} />
              </th>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}
