#!/bin/bash
#
# This script creates a graphical representation of
# the contents in the `src` directory
#

# install the necessary npm modules
npm install

# create .dot file
if [ -f "CFG.dot" ]; then
  rm "CFG.dot"
fi
if [ -f "CFG.png" ]; then
  rm "CFG.png"
fi
npx ts-node controlFlowGraph.ts

# create the .png from the .dot file
dot -Tpng CFG.dot -o CFG.png
