const fs = require('fs');
const path = require('path');

/**
 * Create folders and files
 */

// Create "project/site_specific"
const projectRoot = process.cwd();
const siteSpecificPath = path.join(projectRoot, 'project', 'site_specific');
fs.mkdirSync(siteSpecificPath, { recursive: true });

// Create "lando" folder and "name.yaml" file
const landoPath = path.join(siteSpecificPath, 'lando');
fs.mkdirSync(landoPath, { recursive: true });
fs.writeFileSync(path.join(landoPath, 'name.yaml'), '');

// Create "platform" folder and 3 files
const platformPath = path.join(siteSpecificPath, 'platform');
fs.mkdirSync(platformPath, { recursive: true });
fs.writeFileSync(path.join(platformPath, 'app.disk.yaml'), '2048');
fs.writeFileSync(path.join(platformPath, 'mysql.disk.yaml'), '');
fs.writeFileSync(path.join(platformPath, 'routes.yaml'), '');

// Create composer_requirements.php
const composerContent = `{
    "require": {}
}
`;

fs.writeFileSync(path.join(siteSpecificPath, 'composer_requirements.php'), composerContent);

// Create package.json
const packageJsonContent = `{
    "name": "@colbycommunications/site",
    "version": "1.0.0",
    "description": "",
    "author": "",
    "license": "None",
    "dependencies": {},
    "devDependencies": {},
    "scripts": {}
}
`;

fs.writeFileSync(path.join(siteSpecificPath, 'package.json'), packageJsonContent);

// Create robots.txt
if (!fs.existsSync(path.join(projectRoot, 'robots.txt'))) {
    fs.writeFileSync(
        path.join(projectRoot, 'robots.txt'),
        `User-agent: *
Allow: /
`
    );
}

// Create tests folder
fs.mkdirSync(path.join(projectRoot, 'project', 'site_specific', 'tests'), { recursive: true });

const finalPercyDir = path.join(projectRoot, 'project', 'site_specific', 'tests', 'percy');
fs.mkdirSync(finalPercyDir, { recursive: true });

const finalCypressDir = path.join(projectRoot, 'project', 'site_specific', 'tests', 'cypress');
fs.mkdirSync(finalCypressDir, { recursive: true });

// move percy if it exists
if (fs.existsSync(path.join(projectRoot, 'percy'))) {
    const finalPercyPath = path.join(finalPercyDir, 'percy.js');

    // Move the file
    fs.renameSync(path.join(projectRoot, 'percy', 'percy.js'), finalPercyPath);
    fs.rmdirSync(path.join(projectRoot, 'percy'));
} else {
    fs.writeFileSync(path.join(finalPercyDir, 'percy.js'), '');
}

// Create config folder
fs.mkdirSync(path.join(projectRoot, 'project', 'site_specific', 'config'), { recursive: true });

// Create wp-config-site.php
const wpConfig = `<?php`;

fs.writeFileSync(
    path.join(projectRoot, 'project', 'site_specific', 'config', 'wp-config-site.php'),
    wpConfig
);

// Create scripts folder
fs.mkdirSync(path.join(projectRoot, 'project', 'site_specific', 'scripts'), { recursive: true });

// Create dependencies-run-install-build.sh
const depScriptContent = `
#!/usr/bin/env bash

printf "Installing NPM dependencies for Colby dependencies \n"

shopt -s extglob # Turns on extended globbing

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm

printf "Build Colby Theme... \n"
cd web/wp-content/themes/colby-college-theme
composer install
composer dump-autoload
yarn
yarn scripts:build
cd -

# npm install
shopt -u extglob
`;

fs.writeFileSync(
    path.join(
        projectRoot,
        'project',
        'site_specific',
        'scripts',
        ' dependencies-run-install-build.sh'
    ),
    depScriptContent
);

fs.existsSync('chmod +x project/site_specific/scripts');

console.log('All files and folders created successfully!');

// done
console.log('Site scaffolded successfully!');
