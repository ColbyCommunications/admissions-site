
#!/usr/bin/env bash

printf "Installing NPM dependencies for Colby dependencies"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

# Build Admissions Theme
printf "Build Admissions Theme... \n"
cd web/wp-content/themes/colby-admissions-theme
composer install
composer dump-autoload
npm install
npm run build-prod
cd -

# Build Counselors Plugin
printf "Build Counselors Plugin... \n"
cd web/wp-content/plugins/colby-counselors
composer install
composer dump-autoload
npm install
npm run production
cd -
