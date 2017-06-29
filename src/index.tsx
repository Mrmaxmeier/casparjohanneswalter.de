require('es6-shim')
import * as React from 'react'
import { render } from 'react-dom'
import 'react-router'
import 'react-router-dom'
import * as ReactGA from 'react-ga'
// import * as Raven from 'raven-js'
// TODO: raven-js ts definition
const Raven = require<{
  config: (uri: string) => { install: () => void }
}>('raven-js')

import { Routes } from './routes'
import './static_files'

declare var __IN_BUILD__: boolean

if (__IN_BUILD__) {
  Raven.config('https://d0d4207778da4c05a0006fd4ed80322a@sentry.ente.ninja/3').install()
  ReactGA.initialize('UA-39068556-2')
}

render(
  <Routes analytics={__IN_BUILD__} />,
  document.getElementById('app')
)
