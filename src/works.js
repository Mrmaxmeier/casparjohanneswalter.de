import React from 'react'

export class A extends React.Component {}

export let works = [
  require('../works/175 Sekunden.json'),
  require('../works/Adieu m\'amour · Ay, douloureux · Les tres doulx Yeux.json'),
  require('../works/Aus dem Leben der Amöben.json'),
  require('../works/Beltà, poi chet’assenti (Nachbild 2).json'),
  require('../works/eisklaenge.json')
]

export function sorted () {
  return works
}

export function rows () {
  let rows = [[]]
  sorted().forEach((w) => {
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
