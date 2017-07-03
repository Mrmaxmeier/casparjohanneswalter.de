import { toArray } from 'lodash'

export function resizeArray<T> (arr: T[], length: number, fill: (index: number) => T) {
  let result = toArray(arr.slice(0, length))
  while (result.length < length) {
    result.push(fill(result.length))
  }
  return result
}
