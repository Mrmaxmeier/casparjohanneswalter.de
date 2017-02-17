require('./static_files.js')
require('es6-shim')

import React from 'react'
import { render } from 'react-dom'
import ReactGA from 'react-ga'
import Raven from 'raven-js'

import { Routes } from './routes.jsx'

if (__IN_BUILD__) { // eslint-disable-line no-undef
  Raven.config('https://d0d4207778da4c05a0006fd4ed80322a@sentry.ente.ninja/3').install()
  ReactGA.initialize('UA-39068556-2')
}

render(
  <Routes analytics={__IN_BUILD__} />, // eslint-disable-line no-undef
  document.getElementById('app')
)
