import * as React from 'react'
import { range } from 'lodash'
import { SpecificRangeSlider } from './components'

interface State {
  from: number,
  to: number
}

export class MeanToneCircle extends React.PureComponent<{}, State> {
  private canvas: HTMLCanvasElement
  constructor (props: {}) {
    super(props)
    this.state = {
      from: 0,
      to: 360
    }
    this.componentDidUpdate = this.paint.bind(this)
    this.componentDidMount = this.paint.bind(this)
  }

  paint () {
    let canvas = this.canvas
    let from = this.state.from * (Math.PI / 180)
    let to = this.state.to * (Math.PI / 180)
    if (from > to) {
      let tmp = from
      from = to
      to = tmp
    }
    if (from === to) {
      return false
    }
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx == null) { return }
      ctx.setTransform(1, 0, 0, 1, 0, 0); // TODO: future: ctx.resetTransform()
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ctx.scale(canvas.width, canvas.height)
      ctx.translate(0.5, 0.5)
      ctx.scale(1 / 3, 1 / 3)
      // origin: 0, 0

      let fromX = Math.cos(from)
      let fromY = Math.sin(from)
      let toX = Math.cos(to)
      let toY = Math.sin(to)
      let midX = (fromX + toX) / 2
      let midY = (fromY + toY) / 2
      midX *= 1 - Math.min((to - from) / Math.PI, 1)
      midY *= 1 - Math.min((to - from) / Math.PI, 1)
      let scaleFactor = 1 / Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2))
      scaleFactor *= 2
      if (to - from > Math.PI) {
        scaleFactor = 1
      }
      ctx.scale(scaleFactor, scaleFactor)
      ctx.translate(-midX, -midY)

      ctx.lineWidth = 0.1 / scaleFactor

      ctx.font = (1 / 5) / scaleFactor + 'px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      let debug = (x: number, y: number, color?: string) => {
        ctx.fillStyle = color || 'blue'
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x, y, 0.025 / scaleFactor, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.moveTo(0, 0)
      ctx.beginPath()
      ctx.arc(0, 0, 1, from, to)
      ctx.stroke()

      debug(fromX, fromY)
      debug(toX, toY)
      debug(midX, midY)

      range(55).map((i) => {
        let rad = i / 55 * 2 * Math.PI
        debug(Math.cos(rad), Math.sin(rad), 'red')
        ctx.fillStyle = 'purple'
        let text = ['dank', 'memes'][i % 2]
        ctx.fillText(text, Math.cos(rad), Math.sin(rad))
        /*
        return <div key={i} style={{
          position: 'absolute',
          backgroundColor: 'red',
          width: '4em',
          top: (Math.sin(rad) * 50 + 50) + '%',
          left: (Math.cos(rad) * 50 + 50) + '%',
          transform: 'rotate(' + (rad + Math.PI / 2) + 'rad)',
          transformOrigin: '50% 50%',
          border: '1px solid black',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>{['fisis', 'c', 'deinemudda'][i % 3]}</div>
        */
      })
    }
  }
  render () {
    let size = '750px'
    return (
      <div>
        <canvas style={{height: size, width: size}} width={size} height={size} ref={(e) => { if(e) this.canvas = e }} />
        <div>
          <SpecificRangeSlider defaultMin={0} defaultMax={360} onChange={(val) => {
            this.setState({from: val})
          }}/>
          <SpecificRangeSlider defaultMin={0} defaultMax={360} onChange={(val) => {
            this.setState({to: val})
          }}/>
        </div>
      </div>
    )
  }
}
