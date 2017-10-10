import * as React from 'react'
import { range } from 'lodash'
import { SpecificRangeSlider } from './components'

const TEXT = [
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
  from: number,
  to: number,
  zoom: number
}

export class MeanToneCommaVisualizer extends React.PureComponent<{}, State> {
  private canvas: HTMLCanvasElement
  constructor (props: {}) {
    super(props)
    this.state = {
      fifthCents: 700,
      fifthPreset: '_Preset_',
      from: 0,
      to: 1200,
      zoom: 100
    }
    this.componentDidUpdate = this.paint.bind(this)
    this.componentDidMount = this.paint.bind(this)
  }

  paint () {
    let canvas = this.canvas
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx == null) { return }
      ctx.setTransform(1, 0, 0, 1, 0, 0); // TODO: future: ctx.resetTransform()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.font = '20px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      let debug = (x: number, y: number, color?: string) => {
        ctx.fillStyle = color || 'blue'
        ctx.beginPath()
        const [rX, rY] = stretch(x, y)
        ctx.moveTo(rX, rY)
        ctx.arc(rX, rY, 5, 0, Math.PI * 2)
        ctx.fill()
      }
      const stretch = (x: number, y: number): [number, number] => {
        // x /= (this.state.from - this.state.to) / 1200
        x *= this.state.zoom / 100
        // x += (this.state.from) / 1200
        return [
          (0.9 * x / 2 + 0.5) * canvas.width,
          (0.85 * y / 2 + 0.5) * canvas.height
        ]
      }



      ctx.fillStyle = 'black'
      ctx.font = '18px serif'
      ctx.beginPath()
      ctx.moveTo.apply(ctx, stretch(-1, 1))
      ctx.lineTo.apply(ctx, stretch( 1, 1))
      ctx.stroke()
      range(0, 1200, 100).forEach((cents, index) => {
        let posX = ((cents + 600) % 1200) / 600 - 1
        let posY = 1
        ;[0, 2].forEach(shift => {
          ctx.lineWidth = 3
          ctx.fillStyle = 'black'
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY + 3 / TEXT.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 3 / TEXT.length))
          ctx.stroke()

          const [x, y] = stretch(posX + shift, posY - 5 / TEXT.length)
          ctx.fillText(cents.toString(), x, y);

          ctx.fillStyle = 'gray'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, -1))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 10 / TEXT.length))
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
          let [x, y] = stretch(posX + shift, posY + 5 / TEXT.length)
          ctx.fillText(a.toString(), x, y);
          [x, y] = stretch(posX + shift, posY + 10 / TEXT.length)
          ctx.fillText(b.toString(), x, y)

          ctx.strokeStyle = 'red'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, -1))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 10 / TEXT.length))
          ctx.stroke()
        })
      })

      let centerIndex = 29
      let centerX = (this.state.fifthCents * centerIndex) % 1200 / 600 - 1
      let centerY = 1 - (centerIndex / (TEXT.length / 2))

      ctx.fillStyle = 'black'
      ctx.strokeStyle = 'black'
      ctx.lineWidth = 3
      TEXT.forEach((label, index) => {
        let cents = this.state.fifthCents * index
        let posX = (cents % 1200) / 600 - 1
        let posY = 1 - (index / (TEXT.length / 2))
        posX -= centerX
        posY -= centerY
        posY *= 0.8
        ;[-2, 0, 2].forEach((shift, idx) => {
          // debug(shift + posX, posY, 'black')
          const [x, y] = stretch(shift + posX, posY)

          // TODO: tuple spread
          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY + 2 / TEXT.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY + 6 / TEXT.length))
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo.apply(ctx, stretch(shift + posX, posY - 2 / TEXT.length))
          ctx.lineTo.apply(ctx, stretch(shift + posX, posY - 6 / TEXT.length))
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
      "EDO 19": 694.74,
      "1/3 comma": 694.79,
      "2/7 comma": 695.81,
      "1/4 comma": 696.58,
      "EDO 31": 696.77,
      "1/5 comma": 697.65,
      "1/6 comma": 698.37,
      "EDO 12": 700,
      "EDO 53": 701.89,
      "perfect fifth": 701.96,
      "optimized 7": 702.23,
      "EDO 34": 705.88
    }
    return (
      <div>
        <table>
          <tbody>
            <tr>
              <th>Fifth</th>
              <td>{this.state.fifthCents}</td>
              <td>
                <SpecificRangeSlider defaultMin={694} defaultMax={706} onChange={(val) => {
                  this.setState({ fifthCents: val, fifthPreset: '_Preset_' })
                }}/>
              </td>
              <td>
                <select value={this.state.fifthPreset} onChange={(e) => {
                  let key = e.target.value
                  this.setState({ fifthCents: centPresets[key], fifthPreset: key })
                }}>
                  <option value="_Preset_">Preset</option>
                  {Object.keys(centPresets).map(key =>
                    <option value={key} key={key}>{key}</option>
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
          </tbody>
        </table>
        <canvas style={size} {...size} ref={(e) => { if(e) this.canvas = e }} />
      </div>
    )
  }
}
