#!/bin/bash -i

cd ..
rm -rf nem-ledger-bridge
git clone https://github.com/FDS-Ledger/nem-ledger-bridge.git
npm install -g gulp nexe@3.3.3
cd nem-ledger-bridge && npm install && npm run build && nexe lib/index.js -o nem-ledger-bridge
cd ../NanoWallet
npm install
rm -rf build/
npm run compile
mkdir build/modules && cp -rf ../nem-ledger-bridge build/modules && rm -rf ../nem-ledger-bridge
cd build
nexe run.js -o NanoWallet
