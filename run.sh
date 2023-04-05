#!/bin/bash

# Check if Node.js is already installed
if command -v node &> /dev/null
then
    echo "Node.js is installed!"
else
    echo "Node.js must be installed! Install from here: https://nodejs.org/en/download/"
    exit 1
fi

# Build and run application
npm install
npm run start