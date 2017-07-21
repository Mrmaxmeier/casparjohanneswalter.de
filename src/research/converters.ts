import { number, eval as mathEval } from 'mathjs'
import { find, clone } from 'lodash'
import { Fraction, mod } from './math'

export type Ratio = number
export type Cents = number

export interface MathError {
  error: string
}

export function evalMath(data: string): number | MathError {
  try {
    return mathEval(data)
  } catch (error) {
    return { error: error.toString() }
  }
}

export function evalMathN(data: string): number | null {
  try {
    return mathEval(data)
  } catch (error) {
    return null
  }
}

export function ratioToCents (ratio: Ratio) {
  return Math.log2(ratio) * 1200
}

export function centsToRatio (cents: Cents) {
  return Math.pow(2, cents / 1200)
}

export function centsToOctave (cents: Cents) {
  let n = (cents + 50) / 1200
  let o = Math.trunc(n)
  if (n < 0) {
    o--
  }
  return o
}

export function centsToNote (cents: Cents) {
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

export function centsToNoteDiff (cents: Cents) {
  cents = mod(cents, 1200)
  let noteCents = Math.trunc(cents / 100) * 100
  let diff = Math.abs(cents - noteCents)
  if (diff < 50) {
    return diff
  } else {
    return -(100 - diff)
  }
}

export function concertPitchToC0 (reference: number) {
  return reference / Math.pow(2, (1 / 12) * 57)
}

export function centsToFrequency (cents: Cents, a4: number) {
  return Math.pow(2, (cents / 1200)) * concertPitchToC0(a4)
}

export function intelligenterMediant (in_: Fraction, precision?: number) {
  precision = precision || 2
  let a = Math.floor(in_.value)
  let b = a + 1
  let fractions = [
    new Fraction(a, 1),
    new Fraction(b, 1),
    new Fraction(a * 2 + 1, 2)
  ]
  while (true) {
    let prev = fractions[fractions.length - 1]
    let reversed = clone(fractions).reverse()

    if (prev.value > in_.value) {
      let smaller = find(reversed, (f) => f.value < in_.value)
      if (!smaller) {
        return []
      }
      fractions.push(new Fraction(smaller.numerator + prev.numerator, smaller.denominator + prev.denominator))
    } else {
      let bigger = find(reversed, (f) => f.value > in_.value)
      if (!bigger) {
        return []
      }
      fractions.push(new Fraction(bigger.numerator + prev.numerator, bigger.denominator + prev.denominator))
    }

    let current = fractions[fractions.length - 1]
    if (Math.abs(current.value - in_.value) < 1 / Math.pow(10, precision)) {
      break
    }
  }
  return fractions
}

export function normalizeOctave (n: number) {
  let p = Math.floor(Math.log2(n))
  return n / Math.pow(2, p)
}
