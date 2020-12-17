#!/bin/bash -i

npm run compile
cp electron.js build
cd build
npm i -D electron