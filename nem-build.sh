#!/bin/bash -i

rm -rf build/
npm run build
cd build/modules/nem-ledger-bridge
nexe lib/index.js -o nem-ledger-bridge
cd ../..
npm install opn
nexe run.js -o NanoWallet
./NanoWallet
