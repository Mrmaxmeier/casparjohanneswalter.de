let presets = {
	"Kithara I": {
		"Hexad 1, green": [[8, 7, "o"], [12, 7, 3], [1, 1, 3], [9, 7, 3], [10, 7, 4], [12, 7, 4], [8, 7, 4]],
		"Hexad 6, middle-green": [[7, 4, "u"], [7, 6, 2], [7, 6, 3], [7, 5, 4], [7, 4, 4], [7, 4, 4], [7, 6, 4]],
		"Hexad 7, middle-orange": [[4, 3, "o"], [1, 1, 2], [4, 3, 3], [5, 3, 3], [3, 2, 4], [5, 3, 4], [7, 6, 4]],
		"Hexad 12, orange": [[3, 2, "u"], [12, 7, 3], [1, 1, 3], [6, 5, 3], [3, 2, 4], [12, 7, 4], [6, 5, 4]]
	},
	"Pedal Steel Guitar": {
		"O - 1 / 1": [
			[1, 1, "o"],
			[3, 2, 2],
			[1, 1, 2],
			[5, 4, 2],
			[3, 2, 3],
			[7, 4, 3],
			[9, 8, 3],
			[11, 8, 4],
			[3, 2, 4],
			[7, 4, 4],
			[1, 1, 4]
		],
		"O - 1 / 1, mit 13": [
			[1, 1, "o"],
			[3, 2, 2],
			[1, 1, 2],
			[5, 4, 2],
			[3, 2, 3],
			[7, 4, 3],
			[9, 8, 3],
			[11, 8, 4],
			[13, 8, 4],
			[7, 4, 4],
			[1, 1, 4]
		],
		"U - 9 / 8": [
			[9, 8, "u"],
			[18, 11, 2],
			[1, 1, 2],
			[9, 7, 2],
			[3, 2, 3],
			[9, 5, 3],
			[9, 8, 3],
			[9, 7, 3],
			[3, 2, 4],
			[9, 5, 4],
			[9, 8, 4]
		]
	}
}

let nonNaN = (n) => isNaN(n) ? "" : n

class RatioInput extends React.Component {
	handleChange (c) {
		this.props.changeCB($(c.target).val())
	}
	render() {
		let invalid = isNaN(this.props.data)
		let style = invalid ? {borderColor: 'red'} : {}
		let val = nonNaN(this.props.data)
		return (
			<td>
				<input type="text" tabIndex={this.props.tabIndex} defaultValue={val}
				       value={val} onChange={this.handleChange.bind(this)}
					   style={style}/>
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
		return `/static/kithara_calc/${x}_${y}.png`
	}
	render() {
		let cents = Math.round(frac_to_cent(this.props.frac))
		let octave = nonNaN(this.props.octave)
		let invalid = isNaN(this.props.octave) || this.props.octave == null
		let style = invalid ? {width: "3.5em", heigh: "1.5em", borderColor: 'red'} : {width: "3.5em", heigh: "1.5em"}
		if (this.props.index == 0) {
			if (this.props.isUpper) {
				return (<td className="hidden"></td>)
			} else {
				let overtone = this.props.overtone ? this.props.overtone : "";
				return (
					<td>
						<a href="#" data-row="1" onClick={() => {this.props.applyCB()}}>apply identity</a>
						<br />
						<br />
						<span>
							Overtone:
							<input type="text" tabIndex={this.props.tabIndex}
							       placeholder="" defaultValue={overtone} value={overtone}
							       onChange={(d) => {
									   this.props.setOvertone(parseInt($(d.target).val()))
								   }} style={{width: "3.5em", heigh: "1.5em"}} />
						</span>
					</td>
				)
			}
		}
		return (
			<td>
				<span className="subs">
					Octave:
					<input type="text" tabIndex={this.props.tabIndex} style={style}
					       placeholder="3" defaultValue={octave} value={octave}
					       onChange={(d) => {
							   this.props.setOctaveCB(this.props.index, parseInt($(d.target).val()))
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
			let tabIndexBase = index * 3 + (isUpper ? 1 : 999)
			firstRow.push(<RatioInput tabIndex={tabIndexBase} data={d.ratio[0]} key={`input_${index}`} changeCB={firstCB} />)
			firstRow.push(spacer)
			secondRow.push(<RatioInput tabIndex={tabIndexBase + 1} data={d.ratio[1]} key={`input_${index}`} changeCB={secondCB} />)
			secondRow.push(spacer)
			thirdRow.push(
				<LowerInput isUpper={isUpper} frac={d.ratio} octave={d.octave}
				            tabIndex={tabIndexBase + 2} key={`input_${index}`}
				            applyCB={() => {this.props.applyCB(index)}}
				            index={index} setOctaveCB={this.props.setOctave}
							setOvertone={this.props.setOvertone} overtone={this.props.overtone} />
			)
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
		this.state = this.setStateFromPreset("Kithara I", "Hexad 1, green", false)
	}
	setStateFromPreset(instrument, preset, setState=true) {
		let p = presets[instrument][preset]
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
			}),
			instrument: instrument,
			preset: preset
		}
		console.log(state)
		if (setState) {
			this.setState(state)
		}
		return state
	}
	setPreset(d) {
		let preset = $(d.target).val()
		console.log("setPreset", preset)
		this.setStateFromPreset(this.state.instrument, preset)
	}
	setInstrument(d) {
		let instrument = $(d.target).val()
		let preset = Object.keys(presets[instrument])[0]
		console.log("setInstrument", instrument)
		this.setStateFromPreset(instrument, preset)
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
	setOvertone(overtone) {
		var state = jQuery.extend(true, {}, this.state)
		state.lowerRow[0].overtone = overtone
		state.lowerRow = calcOvertone(state, overtone)
		this.setState(state)
	}
	handleApply(index) {
		console.log(this, index)
		let state = jQuery.extend(true, this.state, {
			upperRow: this.state.upperRow,
			lowerRow: calcState(this.state.upperRow, {
				ratio: this.state.lowerRow[index].ratio,
				octave: this.state.lowerRow[index].octave,
				index: index
			})
		})
		this.setState(state)
	}
	render() {
		return (
			<div style={{padding: "1em"}}>
				<div style={{padding: "1em"}}>
					Instrument: &nbsp;
					<select onChange={this.setInstrument.bind(this)}>
						{$.map(presets, (_, key) => {
							return <option key={key} value={key}>{key}</option>
						})}
					</select>
					&nbsp; Preset: &nbsp;
					<select onChange={this.setPreset.bind(this)}>
						{$.map(presets[this.state.instrument], (_, key) => {
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
					 applyCB={this.handleApply.bind(this)}
					 overtone={this.state.lowerRow[0].overtone}
					 setOvertone={this.setOvertone.bind(this)} />
			</div>
		)
	}
}

ReactDOM.render(
	<KitharaCalc />,
	document.getElementById('kitharacalc')
);
