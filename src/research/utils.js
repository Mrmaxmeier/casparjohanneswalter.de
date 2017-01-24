import { toArray } from 'underline'

export function resizeArray (arr, length, fill) {
  let result = arr.slice(0, length)::toArray()
  while (result.length < length) {
    if (fill) {
      result.push(fill(result.length))
    } else {
      result.push(null)
    }
  }
  return result
}
