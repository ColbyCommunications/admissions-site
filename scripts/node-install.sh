#!/usr/bin/env bash

# choose desired node version
VERSION="10.16.3"
# install node
nvm install ${VERSION}
nvm use ${VERSION}

which npm