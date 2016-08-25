#!/bin/bash

set -e

echo "$ rm -rf build"
rm -rf build

echo "$ webpack"
./node_modules/webpack/bin/webpack.js

echo "$ node build/build.js"
node build/build.js

echo "$ cp -r static build"
cp -r static build
