
window.gcd = function (a, b, depth=0) {
	if (isNaN(a) || isNaN(b) || a == undefined || b == undefined) {
		console.log(a, b, depth)
		throw "a and/or b are undefined/NaN"
	}
	return (b == 0) ? a : gcd(b, a % b, depth+1)
}

window.reduce = function (ratio) {
	let gcd_ = gcd(ratio[0], ratio[1])
	return [ratio[0] / gcd_, ratio[1] / gcd_]
}

window.mul = (a, b) => {
	return reduce([a[0] * b[0], a[1] * b[1]])
}

window.swp = (f) => {
	return [f[1], f[0]]
}

window.div = (a, b) => {
	return mul(a, swp(b))
}

window.cpy = (f) => {
	return [f[0], f[1]]
}

window.repr = (f) => {
	return `${f[0]} / ${f[1]}`
}

window.frac_to_cent = (frac) => {
	return Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1 / 1200))
}


function getMultiplier(obj) {
	var x = obj.ratio[0]
	if ((obj.ratio[0] / obj.ratio[1]) < 4 / 3) {
		x *= 2
	}
	let octave = obj.octave ? obj.octave : 0
	return reduce([ x * 2 ** octave, obj.ratio[1] ])
}

function calcOctave(frac) {
	return Math.floor(Math.log(frac[0] / frac[1]) / Math.log(2))
}

window.calcState = function (state, obj) {
	let multiplier = div(getMultiplier(obj), getMultiplier(state[obj.index]))

	console.log(`Multiplier: ${repr(multiplier)}`)

	return state.map((obj, index) => {
		var ratio = mul(getMultiplier(obj), multiplier)
		var octave = calcOctave(ratio)
		ratio = reduce(div(ratio, [2 ** octave, 1]))
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

		return {
			ratio: ratio,
			octave: octave
		}
	})
}
