
const React = require('react')
const ReactDOM = require('react-dom')

import { RatioInput } from './kithara_components'
import {
	div,
	mul,
	reduce
} from './kithara_math'

let range = num => Array.apply(null, Array(num)).map(function (_, i) {return i})
let clone = obj => JSON.parse(JSON.stringify(obj))

class Rechner extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			main: [1, 1],
			ops: range(16).map((i) => [i + 1, 1])
		}
	}
	outList(data) {
		let nop = () => null
		return (
			<div>
				<table>
					<tbody>
						<tr>
							{data.map((d, i) => {
								let data = !d ? null : d[0]
								return <RatioInput key={i} data={data} isUpper={true} changeCB={nop} disabled={true} />
							})}
						</tr>
						<tr>
							{data.map((d, i) => {
								let data = !d ? null : d[1]
								return <RatioInput key={i} data={data} isUpper={false} changeCB={nop} disabled={true} />
							})}
						</tr>
					</tbody>
				</table>
			</div>
		)
	}
	render() {
		let clamp = (frac) => {
			var steps = 0
			while (frac[0] / frac[1] > 2.0) {
				steps++
				frac[1] *= 2
				if (steps > 99)
					return [null, null]
			}
			while (frac[0] / frac[1] < 1.0) {
				steps++
				frac[0] *= 2
				if (steps > 99)
					return [null, null]
			}
			return reduce(frac)
		}
		let sanetizeFrac = (frac) => {
			let a = parseInt(frac[0])
			let b = parseInt(frac[1])
			if (isNaN(a) || isNaN(b))
				return null
			return [a, b]
		}
		return (
			<div>
				<table>
					<tbody>
						<tr><RatioInput data={this.state.main[0]} isUpper={true} changeCB={(v) => {
							this.setState({main: [v, this.state.main[1]]})
						}} /></tr>
						<tr><RatioInput data={this.state.main[1]} changeCB={(v) => {
							this.setState({main: [this.state.main[0], v]})
						}} /></tr>
					</tbody>
				</table>


				<table>
					<tbody>
						<tr>
							{this.state.ops.map((d, i) => {
								return <RatioInput key={i} data={d[0]} isUpper={true} changeCB={(v) => {
									let ops = clone(this.state.ops)
									ops[i][0] = v
									this.setState({ ops })
								}} />
							})}
						</tr>
						<tr>
							{this.state.ops.map((d, i) => {
								return <RatioInput key={i} data={d[1]} isUpper={false} changeCB={(v) => {
									let ops = clone(this.state.ops)
									ops[i][1] = v
									this.setState({ ops })
								}} />
							})}
						</tr>
					</tbody>
				</table>

				{this.outList(this.state.ops.map((frac) => {
					let main = sanetizeFrac(this.state.main)
					if (!main)
						return
					return clamp(mul(frac, main))
				}))}
				{this.outList(this.state.ops.map((frac) => {
					let main = sanetizeFrac(this.state.main)
					if (!main)
						return
					return clamp(div(main, frac))
				}))}
			</div>
		)
	}
}

ReactDOM.render(
	<Rechner />,
	document.getElementById('rechner')
);
