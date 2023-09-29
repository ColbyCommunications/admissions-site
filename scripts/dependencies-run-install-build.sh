#!/usr/bin/env bash

printf "Installing NPM dependencies for Colby dependencies \n"

shopt -s extglob # Turns on extended globbing

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

cd web/wp-content/themes/colby-admissions-theme
composer install
composer dump-autoload
npm install
npm run build-prod
cd -

cd web/wp-content/plugins/colby-counselors
composer install
composer dump-autoload
npm install
npm run production
cd -

shopt -u extglob