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
