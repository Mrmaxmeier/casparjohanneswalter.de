import { sortBy } from 'underline'

function requireAll (context) {
  return context.keys().map(context)
}

export let works = requireAll(require.context('../works', false, /\.json$/))

export function sorted () {
  return works::sortBy((work) => {
    let year = (work.year || 0) + (work.index || 0) / 10
    return -year
  })
}

export function rows (list) {
  if (list.length === 0) {
    return []
  }
  let rows = [[]];
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
