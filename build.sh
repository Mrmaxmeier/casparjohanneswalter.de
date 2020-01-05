#!/usr/bin/env bash
set -e

echo "$ git pull"
git pull

echo "$ yarn install"
yarn install

echo "$ rm -rf build"
rm -rf build

echo "$ webpack -p --config webpack.config.build.js"
./node_modules/webpack/bin/webpack.js -p --config webpack.config.build.js

echo "$ cp -r static build"
cp -r static build
mkdir -p build/texts/
cp -r src/texts/figures build/texts/

echo "build finished, moving build/ to prod/"

rm -rf prod
mv build prod
