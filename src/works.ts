import { sortBy } from 'lodash'

export interface Work {
  year?: number,
  index?: number,
  tags: string[]
  title: string,
  date?: string,
  dateStr?: string,
  subtitle?: string,
  instrumentation?: string,
  text?: string,
  duration?: string,
  commision?: string,
  dedication?: string,
  ['1st performance']?: string,
  documentation?: string,
  content?: string,
  media?: string[]
}

let reqContext = require.context('../works', false, /\.json$/)
export let works: Work[] = reqContext.keys().map(reqContext)

export function sorted () {
  return sortBy(works, (work) => {
    let year = (work.year || 0) + (work.index || 0) / 10
    return -year
  })
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
