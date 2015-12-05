
const React = require('react')
const $ = require('jquery')

import { presets } from './kithara_presets'

import {
	calcState,
	frac_to_cent,
	calcOvertone
} from './kithara_math'

let nonNaN = (n) => isNaN(n) ? "" : n

let tdWidth = {
	width: '7em',
	maxWidth: '7em'
}

class RatioInput extends React.Component {
	handleChange (c) {
		this.props.changeCB(this.refs.input.value)
	}
	render() {
		let invalid = isNaN(this.props.data)
		let style = invalid ? {
			borderColor: 'red',
			textAlign: 'center',
			width: '5em',
			maxWidth: '5em'
		} : {
			textAlign: 'center',
			width: '5em',
			maxWidth: '5em'
		}
		let tdStyle = this.props.isUpper ? Object.assign({
			borderBottom: '2px black solid'
		}, tdWidth) : tdWidth
		let val = nonNaN(this.props.data)
		return (
			<td style={tdStyle}>
				<input type="text" tabIndex={this.props.tabIndex} defaultValue={val}
				       value={val} onChange={this.handleChange.bind(this)}
					   style={style} ref="input"/>
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

	getCentDisp() {
		let charmap = {
			0: '♮g',
			1: '♭a',
			2: '♮a',
			3: '♭h',
			4: '♮h',
			5: '♮c',
			6: '♯c',
			7: '♮d',
			8: '♭e',
			9: '♮e',
			10: '♮f',
			11: '♯f',
			12: '♮g',
		}

		let cents = frac_to_cent(this.props.frac)
		let near = Math.round(cents / 100) * 100
		let diff = Math.round((cents - near) * 10) / 10

		return charmap[near / 100] + (diff > 0 ? ' +' : ' ') + diff + '¢'

	}

	render() {
		//let cents = Math.round(frac_to_cent(this.props.frac) * 10) / 10
		let cents = this.getCentDisp()
		let octave = nonNaN(this.props.octave)
		let invalid = isNaN(this.props.octave) || this.props.octave == null
		let style = invalid ? {width: "3.5em", heigh: "1.5em", borderColor: 'red'} : {width: "3.5em", heigh: "1.5em"}
		if (this.props.index == 0) {
			if (this.props.isUpper) {
				return (<td style={{visibility: 'hidden'}}></td>)
			} else {
				let overtone = this.props.overtone ? this.props.overtone : "";
				return (
					<td style={tdWidth}>
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
			<td style={tdWidth}>
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
			let spacer = <td style={{padding: '0.7em', visibility: 'hidden', maxWidth: '5em', width: '5em'}} key={`spacer_${index}`} />
			let tabIndexBase = index * 3 + (isUpper ? 1 : 999)
			firstRow.push(<RatioInput tabIndex={tabIndexBase} data={d.ratio[0]} key={`input_${index}`} changeCB={firstCB} isUpper={true} />)
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

export class KitharaCalc extends React.Component {
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
		var state = $.extend(true, {}, this.state)
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
		var state = $.extend(true, {}, this.state)
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
		if (!overtone) {
			this.clearOvertone()
			return
		}
		var state = $.extend(true, {}, this.state)
		state.lowerRow[0].overtone = overtone
		state.lowerRow = calcOvertone(state, overtone)
		this.setState(state)
	}
	clearOvertone() {
		let lowerRow = this.state.lowerRow.map(e => {
			return {
				ratio: e.ratio,
				octave: e.octave,
				overtone: null
			}
		})
		this.setState({ lowerRow })
	}
	handleApply(index) {
		console.log(this, index)
		let state = $.extend(true, this.state, {
			upperRow: this.state.upperRow,
			lowerRow: calcState(this.state.upperRow, {
				ratio: this.state.lowerRow[index].ratio,
				octave: this.state.lowerRow[index].octave,
				index: index
			})
		})
		this.setState(state)
		this.clearOvertone()
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
