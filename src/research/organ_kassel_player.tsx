import * as React from "react";

import { AudioController, AudioControllerRow, FrequencyNode } from "./audioComponents";
import { CompactFrequencyPlayer, MathInput } from "./components";
import { Presets, QuickSaves } from "./presets";

interface IState {
  rows: number;
  concertPitch: number;
  muted: boolean;
  playing: boolean[];

  modes: { [key: string]: boolean },
}

interface ISaveState {
  playing: boolean[];
  modes: { [key: string]: boolean }
}

export class OrganKasselPlayer extends React.PureComponent<{}, IState> {
  private players: { [octave: number]: { [idx: number]: CompactFrequencyPlayer } };
  private quicksaves?: QuickSaves<ISaveState>;

  constructor(props: {}) {
    super(props);
    this.state = {
      concertPitch: 440,
      muted: false,
      playing: new Array(133).fill(false),
      modes: {},
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
        <>
          <FrequencyNode
            volume={this.state.muted ? 0 : 0.5}
            freq={a1 * Math.pow(2, -21 / 12) * Math.pow(2, index / 31)}
            playing={playing && this.state.modes.man2_31tone}
          />
          <FrequencyNode
            volume={this.state.muted ? 0 : 0.5}
            freq={a1 * Math.pow(2, (index - 34) / 12)}
            playing={playing && this.state.modes.man2_8}
          />
          <FrequencyNode
            volume={this.state.muted ? 0 : 0.5}
            freq={a1 * Math.pow(2, (index - 34) / 12) / 2}
            playing={playing && this.state.modes.man2_16}
          />
        </>
      ) : (
          <>
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 22) / 12)}
              playing={playing && this.state.modes.man1_4}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12)}
              playing={playing && this.state.modes.man1_8}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12) * 11 / 4}
              playing={playing && this.state.modes.man1_quarte2}
            />
            <FrequencyNode
              volume={this.state.muted ? 0 : 0.5}
              freq={a1 * Math.pow(2, (index - 72 - 34) / 12) * 19 / 4}
              playing={playing && this.state.modes.man1_mollterz1}
            />
          </>
        )}
    </>;
  }


  public render() {

    const ModeToggle: React.FC<{ k: string }> = ({ children, k }) => <button
      style={{
        background: this.state.modes[k] ? "#f15f55" : "#2196f3",
        margin: "1em",
      }}
      onClick={() => {
        const modes = Object.assign({}, this.state.modes);
        modes[k] = !this.state.modes[k];
        this.setState({ modes })
      }}
    >
      {children}
    </button>

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
                  load={({ playing, modes }) => {
                    this.setState({ playing, modes });
                  }}
                  saveData={() => {
                    return {
                      playing: this.state.playing,
                      modes: this.state.modes,
                    };
                  }}
                  ref={(e: QuickSaves<ISaveState>) => { if (e) { this.quicksaves = e; } }}
                />
              </th>
            </tr>
          </tbody>
        </table>

        <h3>Manual 2 (31-tone)</h3>

        <ModeToggle k="man2_31tone">31-Tone</ModeToggle>
        <ModeToggle k="man2_8">8'</ModeToggle>
        <ModeToggle k="man2_16">16'</ModeToggle>


        <span style={{ display: "grid" }}>
          {this.renderOct(0)}
          {this.renderOct(1)}
          {this.renderOct(2)}
          {this.renderOct(3)}
          {this.renderOct(4)}
        </span>

        <br />
        <img src={require<string>("../../assets/Tastaturlayout_Orgel_Kassel3.png")} style={{
          display: 'block',
          marginLeft: '-6rem',
          maxWidth: 'calc(100% + 6rem)',
        }} />
        <br />

        <h3>Manual 1 (12-tone)</h3>


        <ModeToggle k="man1_4">4'</ModeToggle>
        <ModeToggle k="man1_8">8'</ModeToggle>
        <ModeToggle k="man1_quarte2">Quarte 2</ModeToggle>
        <ModeToggle k="man1_mollterz1">Mollterz 1</ModeToggle>

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
