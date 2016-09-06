import math from 'mathjs'

export function processString (data, via) {
  let handlers = {
    string: (data) => data,
    mathjs: (data) => {
      try {
        return { value: math.eval(data) }
      } catch (error) {
        return { error }
      }
    },
    'mathjs-ignoreerror': (data) => {
      try {
        return math.eval(data)
      } catch (error) {
        return undefined
      }
    }
  }
  return handlers[via](data)
}

export function ratioToCents (ratio) {
  return math.log(ratio, 2) * 1200
}

export function centsToRatio (cents) {
  return math.pow(2, cents / 1200)
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
  let n = math.mod(cents + 50, 1200)
  let i = Math.trunc(n / 100)
  return notes[i]
}

export function centsToNoteDiff (cents) {
  cents = math.mod(cents, 1200)
  let noteCents = Math.trunc(cents / 100) * 100
  let diff = Math.abs(cents - noteCents)
  if (diff < 50) {
    return diff
  } else {
    return -(100 - diff)
  }
}
