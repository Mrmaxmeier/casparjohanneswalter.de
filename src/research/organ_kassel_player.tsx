import * as React from "react";

import { AudioController, AudioControllerRow, FrequencyNode } from "./audioComponents";
import { CompactFrequencyPlayer, MathInput } from "./components";
import { Presets, QuickSaves } from "./presets";

interface IState {
  rows: number;
  concertPitch: number;
  muted: boolean;
  playing: boolean[];
  mode4: boolean;
  mode8: boolean;
  modeQuarte2: boolean;
  modeMollterz1: boolean;
}

interface IPreset {
  mode4: boolean;
  mode8: boolean;
  modeQuarte2: boolean;
  modeMollterz1: boolean;
  playing: boolean[];
  concertPitch: number;
}

interface ISaveState {
  playing: boolean[];
}

export class OrganKasselPlayer extends React.PureComponent<{}, IState> {
  private players: { [octave: number]: { [idx: number]: CompactFrequencyPlayer } };
  private quicksaves?: QuickSaves<ISaveState>;

  constructor(props: {}) {
    super(props);
    this.state = {
      concertPitch: 440,
      mode4: false,
      mode8: false,
      modeMollterz1: false,
      modeQuarte2: false,
      muted: false,
      playing: new Array(133).fill(false),
      rows: 8,
    };
    this.players = {};
  }

  public _setPlayerRef(octave: number, index: number, ref: CompactFrequencyPlayer | null) {
    if (ref === null) { return; }
    if (!this.players[octave]) {
      this.players[octave] = {};
    }
    this.players[octave][index] = ref;
  }

  public renderOct(octIndex: number) {
    const colStart = octIndex >= 6 ? ((octIndex - 6) * 14) : (octIndex * 14);

    const thing = (n: number, offset: number, gridRow: number) => {
      const index = n + octIndex * 12;
      return (
        <span style={{ gridColumnStart: colStart + offset, gridColumnEnd: colStart + offset + 2, gridRow }}>
          {/*this.renderElement(index + 0, true, false, 0)*/}
          <button style={{
            background: this.state.playing[index] ? "#f15f55" : "#2196f3",
            height: "3em",
            margin: ".3em",
            padding: ".5em",
            width: "80%",
          }} onClick={() => {
            const playing = this.state.playing.slice();
            playing[index] = !playing[index];
            this.setState({ playing });
          }} />
        </span>
      );
    };

    return <>
      {thing(1, 1, 2)}
      {thing(2, 2, 1)}
      {thing(3, 3, 2)}
      {thing(4, 4, 1)}
      {thing(5, 5, 2)}
      {thing(6, 7, 2)}
      {thing(7, 8, 1)}
      {thing(8, 9, 2)}
      {thing(9, 10, 1)}
      {thing(10, 11, 2)}
      {thing(11, 12, 1)}
      {thing(12, 13, 2)}
      {(octIndex === 4) || (octIndex === 10) ? (
        thing(13, 15, 2)
      ) : null}
    </>;
  }
  public renderFreqPlayer(playing: boolean, index: number) {
    const a1 = this.state.concertPitch;
    return <>
      {index < 73 ? (
        <FrequencyNode
          volume={this.state.muted ? 0 : 0.5}
          freq={a1 * Math.pow(2, -21 / 12) * Math.pow(2, index / 31)}
          playing={playing}
        />
      ) : (
          <>
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 22) / 12)}
              playing={playing && this.state.mode4}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12)}
              playing={playing && this.state.mode8}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12) * 8 / 3}
              playing={playing && this.state.modeQuarte2}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12) * 24 / 5}
              playing={playing && this.state.modeMollterz1}
            />
          </>
        )}
    </>;
  }
  public render() {

    this.players = new Array(this.state.rows).fill(null);
    return (
      <div>
        <AudioController />
        <table>
          <tbody>
            <AudioControllerRow />
            <tr>
              <th>Concert Pitch a4</th>
              <th>
                <MathInput
                  default={440}
                  onChange={(concertPitch) => {
                    this.setState({ concertPitch });
                  }} />
              </th>
            </tr>
            <tr>
              <th>Mute</th>
              <th>
                <button onClick={() => {
                  this.setState({ muted: !this.state.muted });
                }}>{this.state.muted ? "un" : ""}mute</button>
              </th>
            </tr>
            <Presets name="organkasselplayer" label="Music Preset"
              default={{ saves: [null, null, null, null] }} newAsDefault
              onChange={(_, state) => this.quicksaves && this.quicksaves.setState(state)}
              current={() => (this.quicksaves && this.quicksaves.state) || { saves: [] }} />
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <th>Playing</th>
              <th>
                <QuickSaves
                  load={({ playing }) => {
                    this.setState({ playing });
                  }}
                  saveData={() => {
                    return {
                      playing: this.state.playing,
                    };
                  }}
                  ref={(e: QuickSaves<ISaveState>) => { if (e) { this.quicksaves = e; } }}
                />
              </th>
            </tr>
          </tbody>
        </table>

        <h3>Manual 2 (31-tone)</h3>
        <span style={{ display: "grid" }}>
          {this.renderOct(0)}
          {this.renderOct(1)}
          {this.renderOct(2)}
          {this.renderOct(3)}
          {this.renderOct(4)}
        </span>

        <br />

        <h3>Manual 1 (12-tone)</h3>

        <button
          style={{
            background: this.state.mode4 ? "#f15f55" : "#2196f3",
            margin: "1em",
          }}
          onClick={() => this.setState({ mode4: !this.state.mode4 })}
        >
          4'
        </button>

        <button
          style={{
            background: this.state.mode8 ? "#f15f55" : "#2196f3",
            margin: "1em",
          }}
          onClick={() => this.setState({ mode8: !this.state.mode8 })}
        >
          8'
        </button>

        <button
          style={{
            background: this.state.modeQuarte2 ? "#f15f55" : "#2196f3",
            margin: "1em",
          }}
          onClick={() => this.setState({ modeQuarte2: !this.state.modeQuarte2 })}
        >
          Quarte 2
        </button>

        <button
          style={{
            background: this.state.modeMollterz1 ? "#f15f55" : "#2196f3",
            margin: "1em",
          }}
          onClick={() => this.setState({ modeMollterz1: !this.state.modeMollterz1 })}
        >
          Mollterz 1
        </button>

        <span style={{ display: "grid" }}>
          {this.renderOct(6)}
          {this.renderOct(7)}
          {this.renderOct(8)}
          {this.renderOct(9)}
          {this.renderOct(10)}
        </span>

        {this.state.playing.map((playing, index) => this.renderFreqPlayer(playing, index))}
      </div>
    );
  }
}
