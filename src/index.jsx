require('file-loader!file?name=[name].[ext]!./index.html')
require('style!css!../node_modules/marx-css/css/marx.css')
require('style!css!./dropdown.css') // TODO: scss magic
require('!style!css!sass!./style.scss')

import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './app.jsx'

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
