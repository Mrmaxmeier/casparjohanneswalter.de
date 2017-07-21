import * as React from 'react'

import { clone } from 'lodash'

import { MathInput, NoteDisplay, NoteImage } from './components'
import { concertPitchToC0, ratioToCents } from './converters'

interface Props<V, S> {
  setState?: (state: S, cb?: () => void) => void,
  value: V
}

export abstract class Settings<V, S extends V, P={}>
                extends React.Component<P & Props<V, any>, { override?: V }> {
  constructor (props: P & Props<S, any>) {
    super(props)
    this.state = { override: undefined }
  }

  abstract dump(): V

  onValue (value: V) {
    if (this.props.setState)
      this.props.setState(value, () => {
        this.setState({ override: undefined }, () => {
          
        })
      })
  }

  // TODO: variadic generics (O = V & V)
  static state<V extends O, S extends V, O=any>(settings: Settings<O, S, any>[]): V {
    let p = {} as V
    for (let setting of settings) {
      Object.assign(p, setting.dump())
    }
    return p
  }
}

export interface TConcertPitch { concertPitch: number }
export class ConcertPitchSetting<S extends TConcertPitch> extends Settings<TConcertPitch, S> {
  private input?: MathInput

  static default() { return { concertPitch: 440 } }

  dump () {
    let concertPitch = this.input && this.input.state.value || 440
    return { concertPitch }
  }
  // serialize (v: { concertPitch : string }) { v.concertPitch = this.input.text() }
  // deserialize (preset: { concertPitch: string }) { this.input.setValue(preset.concertPitch, true) }

  value (): string { return this.input && this.input.text() || '' }
  setText(s: string) { this.input && this.input.setValue(s, true) }

  render () {
    return (
      <tr>
        <th>Concert Pitch a4</th>
        <th>
          <MathInput
            wide
            default={440} ref={(e) => { if(e) this.input = e }}
            onChange={(concertPitch) => this.onValue({ concertPitch })} />
        </th>
      </tr>
    )
  }
}


export interface TPitch11Setting { pitch11: number }
export interface TPitch11Props { concertPitch: number }
export class Pitch11Setting<S extends TPitch11Setting> extends Settings<TPitch11Setting, S, TPitch11Props> {
  private input?: MathInput
  private default: number = 440 / 9 * 8;

  static default() { return { pitch11: 440 / 9 * 8 } }

  dump () {
    return { pitch11: this.input && this.input.state.value || this.default }
  }

  value (): string { return this.input && this.input.text() || '' }
  setText(s: string) { this.input && this.input.setValue(s, true) }

  // serialize (v: { pitch11 : string }) { v.pitch11 = this.input.text() }
  // deserialize (preset: { pitch11: string }) { this.input.setValue(preset.pitch11, true) }
  render () {
    let c0 = concertPitchToC0(this.props.concertPitch)
    let cents = ratioToCents(this.dump().pitch11 / c0)
    return (
      <tr>
        <th>Pitch 1 / 1</th>
        <th>
          <MathInput
            wide default="440 / 9 * 8"
            onChange={(pitch11) => this.onValue({ pitch11 })}
            ref={(e) => { if (e) this.input = e }} />
        </th>
        <th>
          <NoteImage cents={cents} />
        </th>
        <th>
          <NoteDisplay cents={cents} />
        </th>
      </tr>
    )
  }
}


export interface TModeSetting { mode: 'ratio' | 'cents' }
export class RatioCentsModeSetting<S extends TModeSetting> extends Settings<TModeSetting, S> {

  static default(): TModeSetting { return { mode: 'ratio' } }

  dump () {
    return this.state.override || this.props.value || { mode: 'ratio' }
  }

  render () {
    return (
      <tr>
        <th>Mode</th>
        <th>
          <select onChange={(e) => {
            let mode = e.target.value
            if (mode === 'ratio' || mode === 'cents') {
              this.onValue({ mode })
            }
          }} value={this.dump().mode}>
            <option value="ratio">Ratio</option>
            <option value="cents">Cents</option>
          </select>
        </th>
      </tr>
    )
  }
}

export interface TMutedSetting { muted: boolean }
export class MutedSetting<S extends TMutedSetting> extends Settings<TMutedSetting, S> {
  static default() { return { muted: false } }
  dump() { return this.props.value || { muted: false } }
  render () {
    return (
      <tr>
        <th>Mute</th>
        <th>
          <button onClick={() => {
            let muted = !this.dump().muted
            this.onValue({ muted })
          }}>{this.dump().muted ? 'un' : ''}mute</button>
        </th>
      </tr>
    )
  }
}




export interface TMemeSetting { meme: 'ratio' | 'cents' }
export class MemeSetting<S extends TMemeSetting> extends Settings<TMemeSetting, S> {
  static default(): TMemeSetting { return { meme: 'ratio' } }
  dump() {
    return this.props.value || { meme: 'ratio'}
  }
  render () {
    return (
      <tr>
        <th>Mode</th>
        <th>
          <select onChange={(e) => {
            let meme = e.target.value
            if (meme === 'ratio' || meme === 'cents')
              this.onValue({ meme })
          }} value={this.dump().meme}>
            <option value="ratio">Ratio</option>
            <option value="cents">Cents</option>
          </select>
        </th>
      </tr>
    )
  }
}

export interface TMemeSwitch { isMeme: boolean }
export class MemeSwitch<S extends TMemeSwitch> extends Settings<TMemeSwitch, S> {
  static default() { return { isMeme: true } }
  dump() {
    return this.props.value || { isMeme: true }
  }
  render () {
    return (null)
  }
}

interface TestMemeP { prop: string }
// export interface TestMemeS { state: number, other: boolean, ...TMemeSetting, ...TMemeSwitch }
interface TestMemeS extends TMemeSetting, TMemeSwitch {
  state: number,
  other: boolean
}
class TestMeme extends React.PureComponent<TestMemeP, TestMemeS> {
  private mset: MemeSetting<TestMemeS>
  private ismset: MemeSwitch<TestMemeS>
  constructor (props: TestMemeP) {
    super(props)
    // let mset = new MemeSetting<TestMemeS>({})
    // let ismset = new MemeSwitch<TestMemeS>({})
    this.state = {
      /*
      ...Settings.state<TMemeSetting & TMemeSwitch, TestMemeS>([
        mset,
        ismset
      ]),
      */
      ...MemeSetting.default(),
      ...MemeSwitch.default(),
      other: true,
      state: 0
    }
  }

  render () {
    return (
      <div>
        <MemeSetting setState={this.setState} value={{ meme: this.state.meme }} />
        <MemeSwitch setState={this.setState} value={{ isMeme: this.state.isMeme }} />
      </div>
    )
  }
}