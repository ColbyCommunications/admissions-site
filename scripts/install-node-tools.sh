#!/usr/bin/env bash
touch "$HOME/.bashrc"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# choose desired node version
VERSION="10.16.3"
# install node
nvm install ${VERSION}
nvm use ${VERSION}


