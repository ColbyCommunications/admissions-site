#!/usr/bin/env bash
touch "$HOME/.bashrc"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v{$NVM_VERSION}/install.sh | bash

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# install node
nvm install $NODE_VERSION
nvm use $NODE_VERSION


unset NPM_CONFIG_PREFIX
        curl -o- https://raw.githubusercontent.com/creationix/nvm/v{$NVM_VERSION}/install.sh | dash
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm current
        nvm install $NODE_VERSION