import * as React from 'react'
import { range } from 'lodash'
import { SpecificRangeSlider, PrecNumber, MathInput } from './components'

const NOTES = [
    "F♭♭♭♭", "C♭♭♭♭", "G♭♭♭♭", "D♭♭♭♭", "A♭♭♭♭", "E♭♭♭♭",
    "B♭♭♭♭", "F♭♭♭", "C♭♭♭", "G♭♭♭", "D♭♭♭",
    "A♭♭♭", "E♭♭♭", "B♭♭♭", "F♭♭", "C♭♭", "G♭♭",
    "D♭♭", "A♭♭", "E♭♭", "B♭♭", "F♭", "C♭",
    "G♭", "D♭", "A♭", "E♭", "B♭", "F♮",
    "C♮", "G♮", "D♮", "A♮", "E♮", "B♮",
    "F#", "C#", "G#", "D#", "A#", "E#",
    "B#", "F##", "C##", "G##", "D##", "A##",
    "E##", "B##", "F###", "C###", "G###", "D###",
    "A###", "E###", "B###", "F####", "C####", "G####",
    "D####", "A####", "E####", "B####"
]


interface State {
  fifthCents: number,
  fifthPreset: string,
  centerIndex: number,
  from: number,
  to: number,
  zoom: number,
  zoomCenter: number,
  noteSelection: {
    from: number
    to: number
  }
}

export class MeanToneCommaVisualizer extends React.PureComponent<{}, State> {
  private canvas?: HTMLCanvasElement
  constructor (props: {}) {
    super(props)
    this.state = {
      fifthCents: 701.955,
      fifthPreset: 'perfect fifth (0 comma)',
      centerIndex: NOTES.findIndex((v) => v === 'C♮'),
      from: 0,
      to: 1200,
      zoom: 100,
      zoomCenter: 0,
      noteSelection: {
        from: 0,
        to: NOTES.length - 1
      }
    }
    this.componentDidUpdate = this.paint.bind(this)
    this.componentDidMount = this.paint.bind(this)
  }

  paint () {
    const canvas = this.canvas
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx == null) { return }
      ctx.setTransform(1, 0, 0, 1, 0, 0); // TODO: future: ctx.resetTransform()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.font = '20px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
  
      // TODO: out-of-bounds

      const debug = (x: number, y: number, color?: string) => {
        ctx.fillStyle = color || 'blue'
        ctx.beginPath()
        const [rX, rY] = stretch(x, y)
        ctx.moveTo(rX, rY)
        ctx.arc(rX, rY, 5, 0, Math.PI * 2)
        ctx.fill()
      }

      const stretch = (x: number, y: number): [number, number] => {
        x -= this.state.zoomCenter / 600
        x *= this.state.zoom / 100
        return [
          (0.9 * x / 2 + 0.5) * canvas.width,
          (0.85 * y / 2 + 0.5) * canvas.height
        ]
      }



      ctx.fillStyle = 'black'
      ctx.font = '18px serif'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo.apply(ctx, stretch(-1, 1))
      ctx.lineTo.apply(ctx, stretch( 3, 1))
      ctx.stroke()
      range(0, 1200, 100).forEach((cents, index) => {
        let posX = ((cents + 600) % 1200) / 600 - 1
        let posY = 1
        ;[0, 2].forEach(shift => {
          ctx.lineWidth = 3
          ctx.fillStyle = 'black'
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY + 3 / NOTES.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 3 / NOTES.length))
          ctx.stroke()

          const [x, y] = stretch(posX + shift, posY - 5 / NOTES.length)
          ctx.fillText(cents.toString(), x, y);

          ctx.fillStyle = 'gray'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, -1))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 10 / NOTES.length))
          ctx.stroke()
        })
      })

      ctx.fillStyle = 'red'
      ctx.lineWidth = 0.5
      ctx.font = '14px serif'
      ;[
        [25, 24],
        [128, 125],
        [16, 15],
        [10, 9],
        [9, 8],
        [8, 7],
        [7, 6],
        [6, 5],
        [5, 4],
        [4, 3],
        [11, 8],
        [7, 5],
        [10, 7],
        [16, 11],
        [3, 2],
        [8, 5],
        [5, 3],
        [12, 7],
        [7, 4],
        [9, 5],
        [16, 9],
        [15, 8]
      ].forEach((data) => {
        const [a, b] = data
        let cents = Math.log2(a / b) * 1200
        let posX = ((cents + 600) % 1200) / 600 - 1
        let posY = 1
        ;[0, 2].forEach(shift => {
          let [x, y] = stretch(posX + shift, posY + 5 / NOTES.length)
          ctx.fillText(a.toString(), x, y);
          [x, y] = stretch(posX + shift, posY + 10 / NOTES.length)
          ctx.fillText(b.toString(), x, y)

          ctx.strokeStyle = 'red'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, -1))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 10 / NOTES.length))
          ctx.stroke()
        })
      })

      let centerX = (this.state.fifthCents * this.state.centerIndex) % 1200 / 600 - 1
      let centerY = 1 - (this.state.centerIndex / (NOTES.length / 2))

      ctx.fillStyle = 'black'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      NOTES.forEach((label, index) => {
        if (this.state.noteSelection.from > index) { return }
        if (this.state.noteSelection.to   < index) { return }

        let cents = this.state.fifthCents * index
        let posX = (cents % 1200) / 600 - 1
        let posY = 1 - (index / (NOTES.length / 2))
        posX -= centerX
        posY -= centerY
        posY *= 0.8
        ;[-2, 0, 2, 4].forEach((shift, idx) => {
          // debug(shift + posX, posY, 'black')
          const [x, y] = stretch(shift + posX, posY)

          // TODO: tuple spread
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY + 2 / NOTES.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY + 6 / NOTES.length))
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY - 2 / NOTES.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 6 / NOTES.length))
          ctx.stroke()
          ctx.fillText(label, x, y);
        })
      })

      /*
      debug(0, 0, 'green')
      debug(1, 1, 'red')
      debug(-1, -1, 'red')
      debug(-1, 1, 'blue')
      debug(1, -1, 'blue')
      */
    }
  }
  render () {
    let size = { width: '750px', height: '500px' }
    const centPresets: { [key: string]: number } = {
      "EDO 19": 694.737,
      "1/3 comma": 694.786,
      "2/7 comma": 695.810,
      "1/4 comma": 696.578,
      "EDO 31": 696.774,
      "1/5 comma": 697.654,
      "1/6 comma": 698.371,
      "EDO 12": 700,
      "schismatic pythagorean, optimized third": 701.711,
      "EDO 53": 701.887,
      "perfect fifth (0 comma)": 701.955,
      "schismatic pythagorean, optimized seventh": 702.227,
      "EDO 34": 705.882
    }
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Fifth</th>
              <td>
                <input
                  type="number"
                  value={this.state.fifthCents}
                  step={0.001}
                  style={{width: '6em'}}
                  onChange={(e) => this.setState({
                    fifthCents: parseFloat(e.target.value)
                  })}
                />
              </td>
              <td>
                <SpecificRangeSlider defaultMin={694} defaultMax={706} step={0.001} onChange={(val) => {
                  this.setState({ fifthCents: val, fifthPreset: '_Preset_' })
                }}/>
              </td>
            </tr>
            <tr>
              <th>Fifth from preset</th>
              <th />
              <td>
                <select value={this.state.fifthPreset} onChange={(e) => {
                  let key = e.target.value
                  if (key === '_Preset_') { return }
                  this.setState({ fifthCents: centPresets[key], fifthPreset: key })
                }}>
                  <option value="_Preset_">Preset</option>
                  {Object.keys(centPresets).map(key =>
                    <option value={key} key={key}>{key} - {centPresets[key]}</option>
                  )}
                </select>
              </td>
            </tr>
            <tr>
              <th>Zoom</th>
              <td>{this.state.zoom}%</td>
              <td>
                <SpecificRangeSlider defaultValue={100} defaultMin={100} defaultMax={600} onChange={(val) => {
                  this.setState({ zoom: val })
                }}/>
              </td>
            </tr>
            <tr>
              <th>Center of Zoom</th>
              <td><PrecNumber digits={4} precision={0} value={this.state.zoomCenter} /> cents</td>
              <td>
                <SpecificRangeSlider defaultValue={0} defaultMin={0} defaultMax={1200} onChange={(val) => {
                  this.setState({ zoomCenter: val })
                }}/>
              </td>
            </tr>
            <tr>
              <th>Center of fifths</th>
              <td>
                <select value={NOTES[this.state.centerIndex]} onChange={(e) => {
                    let key = e.target.value
                    this.setState({ centerIndex: NOTES.findIndex((val) => val === key) })
                  }}>
                  {['C♮', 'G♮', 'D♮', 'A♮'].map(key =>
                    <option value={key} key={key}>{key}</option>
                  )}
                </select>
              </td>
            </tr>
            <tr>
              <th>Visible note range</th>
              <td>
                <select value={this.state.noteSelection.from} onChange={(e) => {
                    let noteSelection = Object.assign({}, this.state.noteSelection)
                    noteSelection.from = parseInt(e.target.value)
                    noteSelection.to = Math.max(noteSelection.from, noteSelection.to)
                    this.setState({ noteSelection })
                  }}>
                  {NOTES.map((text, idx) =>
                    <option value={idx} key={idx}>{text}</option>
                  )}
                </select>
                {' to '}
              </td>
              <td>
                <select value={this.state.noteSelection.to} onChange={(e) => {
                    let noteSelection = Object.assign({}, this.state.noteSelection)
                    noteSelection.to = parseInt(e.target.value)
                    noteSelection.from = Math.min(noteSelection.from, noteSelection.to)
                    this.setState({ noteSelection })
                  }}>
                  {NOTES.map((text, idx) =>
                    <option value={idx} key={idx}>{text}</option>
                  )}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <canvas style={size} {...size} ref={(e) => { if(e) this.canvas = e }} />
      </div>
    )
  }
}
