#!/bin/bash

set -e

echo "$ rm -rf build"
rm -rf build

echo "$ webpack -p --config webpack.config.build.js"
./node_modules/webpack/bin/webpack.js -p --config webpack.config.build.js

echo "$ cp -r static/kithara_calc build"
cp -r static/kithara_calc build
