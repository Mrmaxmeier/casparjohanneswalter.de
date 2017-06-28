
export function gcd (a, b, depth = 0) {
  if (isNaN(a) || isNaN(b) || a === undefined || b === undefined) {
    console.log(a, b, depth)
    let err = 'a and/or b are undefined/NaN'
    throw err
  }
  return (b === 0) ? a : gcd(b, a % b, depth + 1)
}

export function reduce (ratio) {
  let gcd_ = gcd(ratio[0], ratio[1])
  return [ratio[0] / gcd_, ratio[1] / gcd_]
}

export function mul (a, b) {
  return reduce([a[0] * b[0], a[1] * b[1]])
}

export function swp (f) {
  return [f[1], f[0]]
}

export function div (a, b) {
  return mul(a, swp(b))
}

export function cpy (f) {
  return [f[0], f[1]]
}

export function repr (f) {
  f = reduce(f)
  return `${f[0]} / ${f[1]}`
}

export function fracToCent (frac) {
  return Math.log(frac[0] / frac[1]) / Math.log(Math.pow(2, 1 / 1200))
}

function getMultiplier (obj) {
  let x = obj.ratio[0]
  if ((obj.ratio[0] / obj.ratio[1]) < 4 / 3) {
    x *= 2
  }
  let octave = obj.octave ? obj.octave : 0
  return reduce([ x * Math.pow(2, octave), obj.ratio[1] ])
}

function calcOctave (frac) {
  return Math.floor(Math.log(frac[0] / frac[1]) / Math.log(2))
}

export function calcState (state, obj) {
  let multiplier
  if (obj.index === 0) {
    multiplier = div(obj.ratio, state[obj.index].ratio)
    if (multiplier[0] / multiplier[1] < 1) {
      multiplier[0] *= 2
    }
  } else {
    multiplier = div(getMultiplier(obj), getMultiplier(state[obj.index]))
  }

  let passedObj = obj

  return state.map((obj, index) => {
    let ratio = mul(getMultiplier(obj), multiplier)
    let octave = calcOctave(ratio)
    ratio = reduce(div(ratio, [Math.pow(2, octave), 1]))
    if ((ratio[0] / ratio[1]) < 4 / 3) {
      octave--
    }

    if (index === 0) {
      while ((ratio[0] / ratio[1]) >= 2) {
        ratio[1] *= 2
      }
      ratio = reduce(ratio)
    }

    if (passedObj.overtone) {
      octave += Math.log2(passedObj.overtone / (multiplier[0] / multiplier[1]))
    }

    return {
      ratio: ratio,
      octave: octave,
      overtone: passedObj.overtone
    }
  })
}

export function calcOvertone (state, overtone) {
  let ratio = mul(state.upperRow[0].ratio, [overtone, 1])
  let octave = state.upperRow[0].octave
  while ((ratio[0] / ratio[1]) >= 2) {
    ratio[1] *= 2
    octave++
  }
  ratio = reduce(ratio)

  return calcState(state.upperRow, {
    ratio: ratio,
    octave: octave,
    index: 0,
    overtone: overtone
  })
}
