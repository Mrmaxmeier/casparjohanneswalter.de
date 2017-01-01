import { fraction, log, pow, mod, floor, abs, eval as mathEval } from 'mathjs'
import { find } from 'underline'

export function processString (data, via) {
  let handlers = {
    string: (data) => data,
    mathjs: (data) => {
      try {
        return { value: mathEval(data) }
      } catch (error) {
        return { error }
      }
    },
    'mathjs-ignoreerror': (data) => {
      try {
        return mathEval(data)
      } catch (error) {
        return undefined
      }
    }
  }
  return handlers[via](data)
}

export function ratioToCents (ratio) {
  return log(ratio, 2) * 1200
}

export function centsToRatio (cents) {
  return pow(2, cents / 1200)
}

export function centsToOctave (cents) {
  let n = (cents + 50) / 1200
  let o = Math.trunc(n)
  if (n < 0) {
    o--
  }
  return o
}

export function centsToNote (cents) {
  let notes = [
    'C', '#C',
    'D',
    'bE', 'E',
    'F', '#F',
    'G',
    'bA', 'A',
    'bB', 'B'
  ]
  let n = mod(cents + 50, 1200)
  let i = Math.trunc(n / 100)
  return notes[i]
}

export function centsToNoteDiff (cents) {
  cents = mod(cents, 1200)
  let noteCents = Math.trunc(cents / 100) * 100
  let diff = Math.abs(cents - noteCents)
  if (diff < 50) {
    return diff
  } else {
    return -(100 - diff)
  }
}

export function concertPitchToC0 (reference) {
  return reference / pow(2, (1 / 12) * 57)
}

export function centsToFrequency (cents, a4) {
  return pow(2, (cents / 1200)) * concertPitchToC0(a4)
}

export function intelligenterMediant (zahl, precision) {
  precision = precision || 2
  let a = floor(zahl.n / zahl.d)
  let b = a + 1
  let fractions = [
    fraction(a, 1),
    fraction(b, 1),
    fraction(a * 2 + 1, 2)
  ]
  while (true) {
    let prev = fractions[fractions.length - 1]
    let reversed = [].concat(fractions).reverse()

    if (prev > zahl) {
      let smaller = reversed::find((f) => f < zahl)
      if (!smaller) {
        return []
      }
      fractions.push(fraction(smaller.n + prev.n, smaller.d + prev.d))
    } else {
      let bigger = reversed::find((f) => f > zahl)
      if (!bigger) {
        return []
      }
      fractions.push(fraction(bigger.n + prev.n, bigger.d + prev.d))
    }

    let current = fractions[fractions.length - 1]
    if (abs(current - zahl) < 1 / Math.pow(10, precision)) {
      break
    }
  }
  return fractions
}
