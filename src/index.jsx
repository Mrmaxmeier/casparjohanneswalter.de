require('file?name=[name].[ext]!./index.html')
require('file?name=style.css!sass!./style.scss')

import React from 'react'
import ReactDOM from 'react-dom'

import { Routes } from './routes.jsx'

ReactDOM.render(
  <Routes />,
  document.getElementById('app')
)
