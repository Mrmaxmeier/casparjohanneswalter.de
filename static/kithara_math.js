
export function gcd(a, b, depth=0) {
	if (isNaN(a) || isNaN(b) || a == undefined || b == undefined) {
		console.log(a, b, depth)
		throw "a and/or b are undefined/NaN"
	}
	return (b == 0) ? a : gcd(b, a % b, depth+1)
}

export function reduce(ratio) {
	let gcd_ = gcd(ratio[0], ratio[1])
	return [ratio[0] / gcd_, ratio[1] / gcd_]
}

export function mul(a, b) {
	return reduce([a[0] * b[0], a[1] * b[1]])
}

export function swp(f) {
	return [f[1], f[0]]
}

export function div(a, b) {
	return mul(a, swp(b))
}

export function cpy(f) {
	return [f[0], f[1]]
}

export function repr(f) {
	f = reduce(f)
	return `${f[0]} / ${f[1]}`
}

export function frac_to_cent(frac) {
	return Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1 / 1200))
}


function getMultiplier(obj) {
	var x = obj.ratio[0]
	if ((obj.ratio[0] / obj.ratio[1]) < 4 / 3) {
		x *= 2
	}
	let octave = obj.octave ? obj.octave : 0
	return reduce([ x * Math.pow(2, octave), obj.ratio[1] ])
}

function calcOctave(frac) {
	return Math.floor(Math.log(frac[0] / frac[1]) / Math.log(2))
}

export function calcState(state, obj) {
	var multiplier
	if (obj.index == 0) {
		multiplier = div(obj.ratio, state[obj.index].ratio)
		if (multiplier[0] / multiplier[1] < 1) {
			multiplier[0] *= 2
		}
	} else {
		multiplier = div(getMultiplier(obj), getMultiplier(state[obj.index]))
	}

	let passed_obj = obj

	console.log(`Multiplier: ${repr(multiplier)}`)

	return state.map((obj, index) => {

		var ratio = mul(getMultiplier(obj), multiplier)
		var octave = calcOctave(ratio)
		ratio = reduce(div(ratio, [Math.pow(2, octave), 1]))
		if ((ratio[0] / ratio[1]) < 4 / 3) {
			octave--
			console.log(index, octave)
		}

		if (index == 0) {
			while ((ratio[0] / ratio[1]) >= 2) {
				ratio[1] *= 2
			}
			ratio = reduce(ratio)
		}

		if (passed_obj.overtone) {
			octave += Math.log2(passed_obj.overtone / (multiplier[0]/ multiplier[1]))
		}

		return {
			ratio: ratio,
			octave: octave,
			overtone: passed_obj.overtone
		}
	})
}

export function calcOvertone(state, overtone) {
	var ratio = mul(state.upperRow[0].ratio, [overtone, 1])
	var octave = state.upperRow[0].octave
	while ((ratio[0] / ratio[1]) >= 2) {
		ratio[1] *= 2
		octave++
	}
	ratio = reduce(ratio)
	console.log(octave, ratio)

	return calcState(state.upperRow, {
		ratio: ratio,
		octave: octave,
		index: 0,
		overtone: overtone
	})
}
