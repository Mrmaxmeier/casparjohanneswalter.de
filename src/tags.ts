import { works } from './works'
import { mapValues, values } from 'lodash'

let groupsJson = require('../tags.json')

export function tags () {
  let l: string[] = []
  works.forEach((w) => {
    l = l.concat(w.tags)
  })
  mapValues(groupsJson, (subtags) => {
    l = l.concat(subtags)
  })
  return l
}

export function slugify (s: string) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]/, '-')
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
