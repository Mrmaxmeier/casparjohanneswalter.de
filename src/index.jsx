require('./static_files.js')

import React from 'react'
import { render } from 'react-dom'
import ReactGA from 'react-ga'

import { Routes } from './routes.jsx'

if (__IN_BUILD__) { // eslint-disable-line no-undef
  ReactGA.initialize('UA-39068556-2')
}

render(
  <Routes analytics={__IN_BUILD__} />, // eslint-disable-line no-undef
  document.getElementById('app')
)
