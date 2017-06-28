import { toArray } from 'lodash'

export function resizeArray<T> (arr: (T | null)[], length: number, fill: (index: number) => T) {
  let result = toArray(arr.slice(0, length))
  while (result.length < length) {
    if (fill) {
      result.push(fill(result.length))
    } else {
      result.push(null)
    }
  }
  return result
}
