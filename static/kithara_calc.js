
const React = require('react')
const ReactDOM = require('react-dom')

import { KitharaCalc } from './kithara_components'

console.log(KitharaCalc)

ReactDOM.render(
	<KitharaCalc />,
	document.getElementById('kitharacalc')
);
