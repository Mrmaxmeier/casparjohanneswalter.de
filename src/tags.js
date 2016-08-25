let groupsJson = require('../tags.json')

import { works } from './works.js'

import { mapObject, values } from 'underline'

export function tags () {
  let l = []
  works.forEach((w) => {
    l.push(w.tags)
  })
  return l
}

export function groups () {
  return groupsJson::mapObject((subtags, name) => {
    return {
      subtags: subtags,
      name: name,
      show: true
    }
  })::values()
}
