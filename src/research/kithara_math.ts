import { KitharaCalcState } from './kithara_components'
import { Fraction } from './math'

export function fracToCent (frac: Fraction) {
  return Math.log(frac.value) / Math.log(Math.pow(2, 1 / 1200))
}

function getMultiplier (obj: { ratio: Fraction, octave?: number }) {
  let x = obj.ratio.numerator
  if (obj.ratio.value < 4 / 3) {
    x *= 2
  }
  let octave = obj.octave ? obj.octave : 0
  return new Fraction(x * Math.pow(2, octave), obj.ratio.denominator).reduce()
}

function calcOctave (frac: Fraction) {
  return Math.floor(Math.log2(frac.value))
}

export function calcState (
  state: {ratio: Fraction, octave?: number, overtone?: number}[],
  obj: { ratio: Fraction, octave?: number, overtone?: number, index: number }
) {
  let multiplier: Fraction
  if (obj.index === 0) {
    multiplier = obj.ratio.div(state[obj.index].ratio)
    if (multiplier.value < 1) {
      multiplier.numerator *= 2
    }
  } else {
    multiplier = getMultiplier(obj).div(getMultiplier(state[obj.index]))
  }

  let passedObj = obj

  return state.map((obj: {ratio: Fraction, octave?: number, overtone?: number}, index: number) => {
    let ratio = getMultiplier(obj).mul(multiplier)
    let octave = calcOctave(ratio)
    ratio.denominator *= Math.pow(2, octave)
    ratio = ratio.reduce()
    if (ratio.value < 4 / 3) {
      octave--
    }

    if (index === 0) {
      while (ratio.value >= 2) {
        ratio.denominator *= 2
      }
      ratio = ratio.reduce()
    }

    if (passedObj.overtone) {
      octave += Math.log2(passedObj.overtone / multiplier.value)
    }

    return {
      ratio: ratio,
      octave: octave,
      overtone: passedObj.overtone
    }
  })
}

export function calcOvertone (state: KitharaCalcState, overtone: number) {
  let ratio = state.upperRow[0].ratio.clone()
  ratio.numerator *= overtone
  let octave = state.upperRow[0].octave
  if (octave === undefined) { throw 'undefined octave' }
  while (ratio.value >= 2) {
    ratio.denominator *= 2
    octave++
  }
  ratio = ratio.reduce()

  return calcState(state.upperRow, {
    ratio, octave, overtone,
    index: 0
  })
}
