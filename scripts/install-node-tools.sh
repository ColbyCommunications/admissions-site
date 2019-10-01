#!/usr/bin/env bash
shopt -s extglob # Turns on extended globbing
touch "$HOME/.bashrc"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# choose desired node version
VERSION="10.16.3"
# install node
nvm install ${VERSION}
nvm use ${VERSION}


NPM_DIRS=`ls web/wp-content/@(plugins|themes)/colby*/src/@(index.js|style.scss)` # Saves it to a variable
for NPMDIR in $NPM_DIRS; do
  NPMDIR=`dirname NPMDIR`
  cd $NPMDIR
  npm install
  cd -
done

npm install
shopt -u extglob