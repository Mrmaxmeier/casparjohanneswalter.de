import { sortBy } from 'lodash'

function requireAll (context) {
  return context.keys().map(context)
}

interface Work {
  year?: number,
  index?: number,
  tags: string[]
}

export let works: Work[] = requireAll(require.context('../works', false, /\.json$/))

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
