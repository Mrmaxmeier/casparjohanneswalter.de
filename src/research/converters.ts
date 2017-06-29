import { number, eval as mathEval } from 'mathjs'
import { find, clone } from 'lodash'

export type Ratio = number
export type Cents = number
export type Frac = { n: number, d: number }

export function fraction(n: number, d: number): Frac { return { n, d } }
export function fracVal(f: Frac): number { return f.n / f.d }

export function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

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

export function intelligenterMediant (in_: Frac, precision?: number) {
  precision = precision || 2
  let a = Math.floor(fracVal(in_))
  let b = a + 1
  let fractions = [
    fraction(a, 1),
    fraction(b, 1),
    fraction(a * 2 + 1, 2)
  ]
  while (true) {
    let prev = fractions[fractions.length - 1]
    let reversed = clone(fractions).reverse()

    if (fracVal(prev) > fracVal(in_)) {
      let smaller = find(reversed, (f) => fracVal(f) < fracVal(in_))
      if (!smaller) {
        return []
      }
      fractions.push(fraction(smaller.n + prev.n, smaller.d + prev.d))
    } else {
      let bigger = find(reversed, (f) => fracVal(f) > fracVal(in_))
      if (!bigger) {
        return []
      }
      fractions.push(fraction(bigger.n + prev.n, bigger.d + prev.d))
    }

    let current = fractions[fractions.length - 1]
    if (Math.abs(fracVal(current) - fracVal(in_)) < 1 / Math.pow(10, precision)) {
      break
    }
  }
  return fractions
}

export function normalizeOctave (n: number) {
  let p = Math.floor(Math.log2(n))
  return n / Math.pow(2, p)
}
