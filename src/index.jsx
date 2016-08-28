require('file?name=[name].[ext]!./index.html')
require('file?name=style.css!sass!./style.scss')

import React from 'react'
import ReactDOM from 'react-dom'
import ReactGA from 'react-ga'

import { Routes } from './routes.jsx'

ReactGA.initialize('UA-39068556-2')

ReactDOM.render(
  <Routes analytics />,
  document.getElementById('app')
)
