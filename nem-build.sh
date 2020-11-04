#!/bin/bash -i

rm -rf build node_modules
cd external-modules/nem-ledger-bridge && npm install && npm run build && npm run build && nexe lib/index.js -o nem-ledger-bridge
cd ../..
npm install
npm run compile
mkdir build/modules && cp -rf external-modules/nem-ledger-bridge build/modules && rm external-modules/nem-ledger-bridge/nem-ledger-bridge
cd build
npm install opn
nexe run.js -o NanoWallet
