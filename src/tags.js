let groupsJson = require('../tags.json')

import { works } from './works.js'

import { mapObject, values } from 'underline'

export function tags () {
  let l = []
  works.forEach((w) => {
    l = l.concat(w.tags)
  })
  groupsJson::mapObject((subtags) => {
    l = l.concat(subtags)
  })
  return l
}

export function slugify (s) {
  return s.toLowerCase().replace(/[^a-zA-Z0-9]/, '-')
}

export function groups () {
  return groupsJson::mapObject((subtags, name) => {
    return {
      subtags: subtags,
      name: name,
      show: name !== 'Chamber Music'
    }
  })::values()
}
