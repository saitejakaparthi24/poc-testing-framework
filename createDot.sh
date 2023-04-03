#!/bin/bash
#
# This script creates a graphical representation of
# the contents in the `src` directory
#

# install the necessary npm modules

# create .dot file
npx ts-node controlFlowGraph.ts
dot -Tpng CFG.dot -o CFG.png