require('file-loader!file?name=[name].[ext]!./index.html')

import React from 'react'
import ReactDOM from 'react-dom'

import { App } from './app.jsx'

ReactDOM.render(
  <App />,
  document.getElementById('app')
)
