import * as React from 'react'
import { render } from 'react-dom'
import 'react-router'
import 'react-router-dom'
import * as Sentry from '@sentry/browser';

import { Routes } from './routes'
import './static_files'

declare var __IN_BUILD__: boolean

if (__IN_BUILD__) {
  Sentry.init({dsn: "https://6f0f4025e2a941a7974018b93fed8da8@sentry.ente.ninja/2"});
}

render(
  <Routes />,
  document.getElementById('app')
)
