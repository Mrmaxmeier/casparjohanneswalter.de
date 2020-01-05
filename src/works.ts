import { sortBy } from 'lodash'

export interface Work {
  year?: string,
  index: number,
  tags: string[]
  title: string,
  subtitle?: string,
  instrumentation?: string,
  text?: string,
  duration?: string,
  commision?: string,
  dedication?: string,
  wp?: string,
  documentation?: string,
  content?: string,
  media?: string[]
}

export let works: Work[] = require('../works.json') as Work[]

export function sorted () {
  return sortBy(works, (work) => -work.index)
}

export function rows (list?: Work[]) {
  if (list && list.length === 0) {
    return []
  }

  let rows: Work[][] = [[]];

  (list || sorted()).forEach((w) => {
    let current = rows[rows.length - 1]
    if (current.length === 2) {
      current = [w]
      rows.push(current)
    } else {
      current.push(w)
    }
  })
  return rows
}
