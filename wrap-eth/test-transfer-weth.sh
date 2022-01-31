#!/usr/bin/env bash
truffle test \
        ./test/TransferWETH.test.js \
        ./test/contracts/TransferTest.sol \
        --compile-all