require('file-loader?name=[name].[ext]!./index.html')
require('file-loader?name=style.css!sass-loader!./style.scss')

require('file-loader?name=robots.txt!../static/robots.txt')
