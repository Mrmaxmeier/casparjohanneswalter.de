import { format } from 'mathjs'
import * as React from 'react'

import { AudioProvider, IAudioProvider, IPlayable, SoundGenProvider } from './audio'
import { FrequencyNode } from './audioComponents'
import { centsToNote, centsToNoteDiff, centsToOctave, evalMath, MathError } from './converters'
import { Fraction } from './math'

interface MathInputProps extends React.Props<MathInput> {
  default?: (number | string);
  onChange?: (v: number) => void;
  onError?: (e: MathError) => void;
  wide?: boolean;
  size?: number;
}

interface MathInputState extends React.ComponentState {
  value?: number;
  error?: MathError;
}

export class MathInput extends React.PureComponent<MathInputProps, MathInputState> {
  private elem?: HTMLInputElement;
  constructor(props: MathInputProps) {
    super(props);
    let value: number | undefined;
    if (typeof props.default === "string") {
      const res = evalMath(props.default);
      if (typeof res === "number") {
        value = res;
      }
    }
    this.state = {
      value,
      error: undefined,
    };
  }

  public setValue(value: number | string, callOnChange?: boolean) {
    if (this.elem) {
      this.elem.value = value.toString()
    }
    const parsed = evalMath(value.toString());
    if (typeof parsed === "number") {
      this.setState({ value: parsed, error: undefined });
      if (callOnChange && this.props.onChange) {
        this.props.onChange(parsed);
      }
    } else {
      this.setState({ error: parsed });
      if (callOnChange && this.props.onError) {
        this.props.onError(parsed);
      }
    }
  }

  public render() {
    const style = this.props.wide ? {
      width: "7.5em",
      height: "1.5em",
      color: ""
    } : {
        width: (this.props.size || 3.5) + "em",
        height: "1.5em",
        color: ""
      };
    if (this.state.error) {
      style["color"] = "red"
    }
    let default_: string | undefined;
    if (typeof this.props.default === "number") {
      default_ = this.props.default.toString();
    } else {
      default_ = this.props.default;
    }
    return (
      <input type="text" ref={(e) => { if (e) { this.elem = e } }}
        defaultValue={default_}
        onChange={(d) => {
          const parsed = evalMath(d.target.value);
          if (typeof parsed === "number") {
            this.setState({ value: parsed, error: undefined });
            if (this.props.onChange) {
              this.props.onChange(parsed);
            }
          } else {
            this.setState({ error: parsed });
            if (this.props.onError) {
              this.props.onError(parsed);
            }
          }
        }}
        style={style}
      />
    );
  }

  public text() {
    return (this.elem && this.elem.value) || "";
  }
}

interface FractionInputProps extends React.Props<any> {
  onValue: (f: Fraction) => void;
  disabled?: boolean;
  value: Fraction | null;
}

interface FractionInputState extends React.ComponentState {
  numerator: string; denominator: string;
}

export class FractionInput extends React.PureComponent<FractionInputProps, FractionInputState> {
  constructor(props: FractionInputProps) {
    super(props);
    const numerator = props.value && props.value.numerator.toString() || ""
    const denominator = props.value && props.value.denominator.toString() || ""
    this.state = { numerator, denominator };
  }

  public handleChange(n: string, d: string) {
    if (parseFloat(n) && parseFloat(d)) {
      this.props.onValue(new Fraction(parseFloat(n), parseFloat(d)));
    }
  }

  public getDerivedStateFromProps(nextProps: FractionInputProps, state: FractionInputState) {
    if (nextProps.value !== null) {
      const numerator = nextProps.value && nextProps.value.numerator.toString() || ""
      const denominator = nextProps.value && nextProps.value.denominator.toString() || ""
      return { numerator, denominator };
    }
  }

  public render() {
    const style = {
      width: "5em",
      maxWidth: "5em",
      color: this.props.disabled ? "#444" : undefined,
    };

    const tdStyle = {
      width: "5em",
      maxWidth: "5em",
      padding: 0,
    };

    return (
      <table style={{ margin: 0 }}>
        <tbody>
          <tr>
            <td style={Object.assign({ borderBottom: "2px black solid" }, tdStyle)}>
              <input type="text"
                value={this.state.numerator} onChange={(e) => {
                  const numerator = e.target.value; // parseFloat(e.target.value) || undefined
                  this.handleChange(numerator, this.state.denominator);
                  this.setState({ numerator });
                }}
                style={{ textAlign: "center", ...style }} disabled={this.props.disabled} />
            </td>
          </tr>
          <tr>
            <td style={tdStyle}>
              <input type="text"
                value={this.state.denominator} onChange={(e) => {
                  const denominator = e.target.value; // parseFloat(e.target.value) || undefined
                  this.handleChange(this.state.numerator, denominator);
                  this.setState({ denominator });
                }}
                style={{ textAlign: "center", ...style }} disabled={this.props.disabled} />
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}

interface PrecNumberProps extends React.Props<any> {
  value: number;
  precision?: number;
  digits?: number;
  style?: {};
}

export class PrecNumber extends React.PureComponent<PrecNumberProps, {}> {
  public render() {
    let precision = this.props.precision;
    if (precision == undefined) {
      precision = 2;
    }
    let s = format(this.props.value, { precision, notation: "fixed" });
    const style = Object.assign({
      fontFamily: "monospace"
    }, this.props.style || {});
    if (this.props.digits != null) {
      const pad = this.props.digits - (s.length) + precision + 1;
      for (let i = 0; i < pad; i++) {
        s = " " + s;
      }
    }
    return <span style={style}>{s}</span>;
  }
}

interface SpecificRangeSliderProps extends React.Props<SpecificRangeSlider> {
  defaultMin: number;
  defaultMax: number;
  defaultValue?: number;
  step?: number;
  onChange: (_: number) => void;
}

interface SpecificRangeSliderState extends React.ComponentState {
  value: number;
  min: number;
  max: number;
}

export class SpecificRangeSlider extends React.PureComponent<SpecificRangeSliderProps, SpecificRangeSliderState> {
  private min?: MathInput;
  private max?: MathInput;
  private slider?: HTMLInputElement;

  constructor(props: SpecificRangeSliderProps) {
    super(props);
    this.state = {
      value: props.defaultValue !== undefined ? props.defaultValue : (props.defaultMin + props.defaultMax) / 2,
      min: props.defaultMin,
      max: props.defaultMax,
    };
  }

  public setValue(value: number, callOnChange?: boolean) {
    const max = this.state.max;
    const min = this.state.min;
    if (value > max) {
      if (this.max) {
        this.max.setValue(value)
      }
      this.setState({ max: value, value });
    } else if (value < min) {
      if (this.min) {
        this.min.setValue(value)
      }
      this.setState({ min: value, value });
    } else {
      this.setState({ value });
    }

    if (callOnChange && this.props.onChange) {
      this.props.onChange(value);
    }
  }

  public render() {
    const max = this.state.max;
    const min = this.state.min;
    const step = this.props.step || (max - min < 100 ? 0.1 : 1);
    return (
      <span>
        <MathInput default={this.props.defaultMin}
          onChange={(min) => {
            this.setState({ min });
          }} ref={(e) => { if (e) { this.min = e } }} />
        <input type="range" style={{ width: "20em", verticalAlign: "middle" }}
          min={min} max={max} step={step} value={this.state.value}
          onChange={(event) => {
            const value = parseFloat(event.target.value);
            this.setState({ value });
            this.props.onChange(value);
          }} ref={(e) => { if (e) { this.slider = e } }} />
        <MathInput default={this.props.defaultMax}
          onChange={(max) => {
            this.setState({ max });
          }} ref={(e) => { if (e) { this.max = e } }} />
      </span>
    );
  }
}

interface FreqPlayerProps extends React.Props<FreqPlayer> {
  freq: number;
  inTable?: boolean;
  showTypePicker?: boolean;
  defaultVolume?: number;
  text?: string;
}

interface FreqPlayerState extends React.ComponentState {
  isPlaying: boolean;
  volume: number;
  provider: string;
}

export class FreqPlayer extends React.PureComponent<FreqPlayerProps, FreqPlayerState> {
  private provider: IAudioProvider;
  constructor(props: FreqPlayerProps) {
    super(props);
    this.state = {
      isPlaying: false,
      volume: props.defaultVolume || 0.5,
      provider: "sine"
    };
    this.provider = new AudioProvider({
      volume: this.state.volume * 0.2,
      frequency: this.props.freq,
    }, "sine");
  }

  public updateProvider() {
    this.provider.setOptions({
      volume: this.state.volume * 0.2,
      frequency: this.props.freq,
    });
  }

  public valInvalid() { return !this.props.freq; }
  public setPlaying(isPlaying: boolean) {
    if (this.valInvalid()) { return; }
    if (isPlaying) {
      this.provider.play();
    } else {
      this.provider.stop();
    }
    this.setState({ isPlaying });
  }

  public componentWillUnmount() {
    this.provider.unload();
  }

  public componentDidUpdate(prevProps: FreqPlayerProps, prevState: FreqPlayerState) {
    this.updateProvider();
  }

  public renderBody() {
    const isPlaying = this.state.isPlaying;
    return (
      <tr>
        <th>
          {this.props.text || "Frequency:"}
        </th>
        <th>
          {this.props.freq <= 0 || this.props.freq >= 22050 ? (
            <PrecNumber digits={5} value={this.props.freq} style={{ color: "red" }} />
          ) : <PrecNumber digits={5} value={this.props.freq} />} (hz)
        </th>
        <th>
          <button disabled={isPlaying} onClick={() => {
            this.setPlaying(true);
          }}>Play</button>
        </th>
        <th>
          <button disabled={!isPlaying} onClick={() => {
            this.setPlaying(false);
          }}>Stop</button>
        </th>
        <th>
          <input type="range" style={{ verticalAlign: "middle" }}
            min={0} max={1} step={0.01} value={this.state.volume}
            onChange={(event) => {
              const volume = parseFloat(event.target.value);
              this.setState({ volume });
            }} />
        </th>
        <th>
          <PrecNumber precision={3} value={this.state.volume} />
        </th>
        {this.props.showTypePicker ? (
          <th>
            <select onChange={(event) => {
              const provider = event.target.value;
              console.log("switching audio provider to", provider);
              this.provider.unload();
              if (["sine", "sawtooth", "square"].indexOf(provider) !== -1) {
                this.provider = new AudioProvider({}, provider);
              } else if (provider === "soundgen") {
                this.provider = new SoundGenProvider({});
              }
              this.updateProvider();
              if (this.state.isPlaying) {
                this.provider.play();
              }
            }}>
              <option value="sine">Sine</option>
              <option value="sawtooth">Sawtooth</option>
              <option value="square">Square</option>
              <option value="soundgen">Soundgen</option>
            </select>
          </th>
        ) : null}
      </tr>
    );
  }

  public render() {
    if (this.props.inTable) {
      return this.renderBody();
    }
    return (
      <table>
        <tbody>
          {this.renderBody()}
        </tbody>
      </table>
    );
  }
}

interface CompactFrequencyPlayerProps extends React.Props<CompactFrequencyPlayer> {
  freq?: number;
  muted?: boolean;
  buttonStyle?: {};
  text?: string;
}

export class CompactFrequencyPlayer extends React.PureComponent<CompactFrequencyPlayerProps, { isPlaying: boolean }> {
  constructor(props: CompactFrequencyPlayerProps) {
    super(props);
    this.state = {
      isPlaying: false,
    };
  }

  public valInvalid() { return !this.props.freq; }
  public setPlaying(isPlaying: boolean) {
    if (this.valInvalid()) { return; }
    this.setState({ isPlaying });
  }

  public play() {
    if (this.valInvalid()) { return; }
    this.setState({ isPlaying: true });
  }

  public stop() { this.setState({ isPlaying: false }); }

  public render() {
    const isPlaying = this.state.isPlaying;
    const style = Object.assign({ background: isPlaying ? "#f15f55" : "#2196f3" }, this.props.buttonStyle || {});
    const text = this.props.text !== undefined ? this.props.text : (isPlaying ? "Stop" : "Play");
    return (
      <div>
        <button style={style} onClick={() => {
          this.setPlaying(!isPlaying);
        }} disabled={!this.props.freq || this.props.muted}>{text}</button>
        {this.props.freq !== undefined ? (
          <FrequencyNode
            volume={this.props.muted ? 0 : 0.5}
            freq={this.props.freq}
            playing={this.state.isPlaying}
          />
        ) : null}
      </div>
    );
  }
}

export class NoteImage extends React.PureComponent<{ cents: number }, {}> {
  public render() {
    const a = Math.floor((this.props.cents + 100 / 12) * 72 / 1200);
    const octave = centsToOctave(this.props.cents);
    // let x = this.props.octave + Math.floor(a / 72)
    const mod = (a: number, b: number) => {
      return ((a % b) + b) % b;
    };
    const y = mod(a, 72);
    return (
      <img style={{ width: "6em" }} src={`/static/kithara_calc/${octave}_${y}.png`} />
    );
  }
}

export class NoteDisplay extends React.PureComponent<{ cents: number }, {}> {
  public render() {
    const cents = this.props.cents;
    const octave = centsToOctave(cents);
    const note = centsToNote(cents);
    const diff = centsToNoteDiff(cents);
    return (
      <div>
        {note}{octave}
        {diff > 0 ? " +" : " "}
        {diff !== 0 ? <PrecNumber value={diff} precision={1} /> : null}
        {diff !== 0 ? "¢" : null}
      </div>
    );
  }
}

export class StringValueVisualisation extends React.PureComponent<{
  values: { [key: string]: number },
}, {}> {
  public render() {
    return (
      <div style={{ position: "relative" }}>
        <img src={require<string>("../../assets/KlavierSaite.png")} />
        {Object.keys(this.props.values).map((color) => {
          const value = this.props.values[color];
          const offset = value * 196 + 0.9;
          if (value === undefined || value === null) {
            return null;
          }
          return (
            <div key={color} style={{
              background: color,
              width: "5px",
              height: "30%",
              position: "absolute",
              top: "40%",
              left: "calc(" + offset + "% - 2px)"
            }} />
          );
        })}
      </div>
    );
  }
}

interface PlayAllButtonProps extends React.Props<any> {
  playerRefs: IPlayable[];
  disabled?: boolean;
}

export class PlayAllButton extends React.PureComponent<PlayAllButtonProps, { active: boolean }> {
  constructor(props: PlayAllButtonProps) {
    super(props);
    this.state = {
      active: false,
    };
    this.toggle = this.toggle.bind(this);
  }

  public set(value: boolean) {
    this.setState({ active: value });
    this.props.playerRefs.forEach((p) => p.setPlaying(value));
  }

  public toggle() {
    this.set(!this.state.active);
  }

  public render() {
    return (
      <button
        style={{ background: this.state.active ? "#f15f55" : "#2196f3" }}
        onClick={this.toggle} disabled={this.props.disabled}>
        {this.state.active ? "Stop All" : "Play All"}
      </button>
    );
  }
}
