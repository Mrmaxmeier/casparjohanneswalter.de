import { works } from './works'
import { mapValues, values } from 'lodash'

let groupsJson = require<{
  [key: string]: string[]
}>('../tags.json')

export function tags () {
  let l: string[] = []
  works.forEach((w) => {
    if (w.tags)
      l = l.concat(w.tags)
  })
  mapValues(groupsJson, (subtags) => {
    l = l.concat(subtags)
  })
  let res = Array.from(new Set(l));
  res.sort();
  return res
}

export function slugify (s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
}

export function groups () {
  return values(Object.keys(groupsJson).map((name) => {
    return {
      subtags: groupsJson[name],
      name: name,
      show: name !== 'Chamber Music'
    }
  }))
}
