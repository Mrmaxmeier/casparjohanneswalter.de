let presets = {
	"Hexad 1, green": [[8, 7, "o"], [12, 7, 3], [1, 1, 3], [9, 7, 3], [10, 7, 4], [12, 7, 4], [8, 7, 4]],
	"Hexad 6, middle-green": [[7, 4, "u"], [7, 6, 2], [7, 6, 3], [7, 5, 4], [7, 4, 4], [7, 4, 4], [7, 6, 4]],
	"Hexad 7, middle-orange": [[4, 3, "o"], [1, 1, 2], [4, 3, 3], [5, 3, 3], [3, 2, 4], [5, 3, 4], [7, 6, 4]],
	"Hexad 12, orange": [[3, 2, "u"], [12, 7, 3], [1, 1, 3], [6, 5, 3], [3, 2, 4], [12, 7, 4], [6, 5, 4]]
}

class RatioInput extends React.Component {
	handleChange (c) {
		this.props.changeCB($(c.target).val())
	}
	render() {
		return (
			<td>
				<input type="text" tabIndex={this.props.tabIndex} defaultValue={this.props.data} value={this.props.data} onChange={this.handleChange.bind(this)}></input>
			</td>
		)
	}
}

class LowerInput extends React.Component {
	getImg() {
		let a = Math.floor((frac_to_cent(this.props.frac) + 100 / 12) * 72 / 1200)
		let x = this.props.octave + Math.floor(a / 72)
		let mod = (a, b) => {
			return ((a % b) + b) % b
		}
		let y = mod(a + 42, 72)
		return `/kithara_calc/${x}_${y}.png`
	}
	render() {
		let cents = Math.round(frac_to_cent(this.props.frac))
		let octave = this.props.octave
		return (
			<td>
				<span className="subs">
					Octave:
					<input type="text" tabIndex={this.props.tabIndex} style={{width: "3.5em", heigh: "1.5em"}}
					       placeholder="3" defaultValue={octave}
					       onChange={(d) => {
							   this.props.setOctaveCB(this.props.index, $(d.target).val())
						   }} />
				</span>
				<div className="cents">{cents}</div>
				{this.props.isUpper ? null : (
					<a href="#" data-row="1" onClick={() => {this.props.applyCB()}}>apply</a>
				)}
				<img style={{maxWidth: "5em"}} src={this.getImg()} />
			</td>
		)
	}
}

class Row extends React.Component {
	render() {
		let data = this.props.data
		let isUpper = this.props.isUpper

		var firstRow = []
		var secondRow = []
		var thirdRow = []

		data.map((d, index) => {
			let firstCB = (val) => {this.props.setCB(index, [parseInt(val), d.ratio[1]])}
			let secondCB = (val) => {this.props.setCB(index, [d.ratio[0], parseInt(val)])}
			let spacer = <td className="hidden" key={`spacer_${index}`} />
			firstRow.push(<RatioInput tabIndex="1" data={d.ratio[0]} key={`input_${index}`} changeCB={firstCB} />)
			firstRow.push(spacer)
			secondRow.push(<RatioInput tabIndex="1" data={d.ratio[1]} key={`input_${index}`} changeCB={secondCB} />)
			secondRow.push(spacer)
			if (index == 0) {
				thirdRow.push(<td className="hidden" key={"firstSpacer"}></td>)
			} else {
				thirdRow.push(
					<LowerInput isUpper={isUpper} frac={d.ratio} octave={d.octave}
					            tabIndex="6" key={`input_${index}`}
								applyCB={() => {this.props.applyCB(index)}}
								index={index} setOctaveCB={this.props.setOctave}/>
				)
			}
			thirdRow.push(spacer)
		})
		return (
			<table>
				<tbody>
					<tr>{firstRow}</tr>
					<tr>{secondRow}</tr>
					<tr>{thirdRow}</tr>
				</tbody>
			</table>
		)
	}
}

class KitharaCalc extends React.Component {
	constructor(props) {
		super(props)
		this.state = this.setStateFromPreset(presets["Hexad 1, green"], false)
	}
	setStateFromPreset(p, setState=true) {
		console.log(p)
		let row = p.map((a, index) => {
			if (index == 0) {
				return {
					ratio: [a[0], a[1]],
					type: a[2]
				}
			}
			return {
				ratio: [a[0], a[1]],
				octave: a[2]
			}
		})
		let state = {
			upperRow: row,
			lowerRow: calcState(row, {
				ratio: [3, 2],
				octave: 3,
				index: 2
			})
		}
		console.log(state)
		if (setState) {
			this.setState(state)
		}
		return state
	}
	setPreset(d) {
		console.log("setPreset", $(d.target).val())
		this.setStateFromPreset(presets[$(d.target).val()])
	}
	setRatioCB(isUpper, index, ratio) {
		var state = jQuery.extend(true, {}, this.state)
		if (isUpper) {
			state.upperRow[index].ratio = ratio
		} else {
			state.lowerRow[index].ratio = ratio
		}
		this.setState(state)
		if (isUpper) {
			this.state = state
			this.handleApply(1)
		}
	}
	setOctave(isUpper, index, octave) {
		console.log(isUpper, index, octave)
		var state = jQuery.extend(true, {}, this.state)
		if (isUpper) {
			state.upperRow[index].octave = octave
		} else {
			state.lowerRow[index].octave = octave
		}
		this.setState(state)
		if (isUpper) {
			this.state = state
			this.handleApply(1)
		} else {
			this.state = state
			this.handleApply(index)
		}
	}
	handleApply(index) {
		console.log(this, index)
		this.setState({
			upperRow: this.state.upperRow,
			lowerRow: calcState(this.state.upperRow, {
				ratio: this.state.lowerRow[index].ratio,
				octave: this.state.lowerRow[index].octave,
				index: index
			})
		})
	}
	render() {
		return (
			<div style={{padding: "1em"}}>
				<div style={{padding: "1em"}}>
					Preset: &nbsp;
					<select onChange={this.setPreset.bind(this)}>
						{$.map(presets, (_, key) => {
							return <option key={key} value={key}>{key}</option>
						})}
					</select>
				</div>
				<Row isUpper={true} data={this.state.upperRow}
				     setCB={this.setRatioCB.bind(this, true)}
					 setOctave={this.setOctave.bind(this, true)}
					 applyCB={this.handleApply.bind(this)} />
				<Row isUpper={false} data={this.state.lowerRow}
				     setCB={this.setRatioCB.bind(this, false)}
					 setOctave={this.setOctave.bind(this, false)}
					 applyCB={this.handleApply.bind(this)} />
			</div>
		)
	}
}

ReactDOM.render(
	<KitharaCalc />,
	document.getElementById('kitharacalc')
);
