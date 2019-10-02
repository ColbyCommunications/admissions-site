#!/usr/bin/env bash

printf "Installing NPM dependencies for Colby dependencies \n"

shopt -s extglob # Turns on extended globbing

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

NPM_DIRS=`ls web/wp-content/@(plugins|themes)/colby-*/src/@(index.js|style.scss)` # Saves it to a variable
for NPMDIR in $NPM_DIRS; do
  NPMDIR=`dirname $NPMDIR`
  NPMDIR_PRUNED=${NPMDIR:0:$((${#NPMDIR}-3))}
  cd $NPMDIR_PRUNED
  printf "Installing NPM dependenies for ${NPMDIR_PRUNED}... \n"
  npm install
  cd -
done

# npm install
shopt -u extglob