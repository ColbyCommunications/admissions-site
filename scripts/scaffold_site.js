const fs = require('fs');
const path = require('path');

/**
 * Create folders and files
 */

// Create "project/site_specific"
const projectRoot = process.cwd();
const siteSpecificPath = path.join(projectRoot, 'project', 'site_specific_test');
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
} else {
    fs.writeFileSync(path.join(finalPercyDir, 'percy.js'), '');
}

fs.rmdirSync(path.join(projectRoot, 'percy'));

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

fs.writeFileSync(path.join(projectRoot, 'project', 'site_specific', 'scripts'), depScriptContent);

fs.existsSync('chmod +x project/site_specific/scripts');

console.log('All files and folders created successfully!');

/**
 * Make file edits
 */

let updatedContent = '';
let content = '';

// .platform.app.yaml --------------------
const platformYamlFilePath = path.join(process.cwd(), '.platform.app.yaml');
content = fs.readFileSync(platformYamlFilePath, 'utf8');

// Replace "disk:" with include statement
updatedContent = content.replace(
    /^(\s*)disk:\s*\d+\s*$/m,
    '$1disk: !include project/site_specific/platform/app.disk.yaml'
);

// Write the updated content back to the file
fs.writeFileSync(platformYamlFilePath, updatedContent, 'utf8');
console.log('.platform.app.yaml processed successfully!');

// .lando.yml --------------------
const landoYamlFilePath = path.join(process.cwd(), '.lando.yml');
content = fs.readFileSync(landoYamlFilePath, 'utf8');

updatedContent = content.replace(
    /^(\s*)name:\s*.+\s*$/m,
    '$1name: !include project/site_specific/lando/name.yaml'
);
fs.writeFileSync(landoYamlFilePath, updatedContent, 'utf8');

console.log('.lando.yaml processed successfully!');

// routes.yaml --------------------
const platformRoutesYamlFilePath = path.join(process.cwd(), '/.platform/routes.yaml');
content = fs.readFileSync(platformRoutesYamlFilePath, 'utf8');

const lines = content.split('\n');
const includeLine = '        !include project/site_specific/platform/routes.yaml'; // 6 spaces for indentation

for (let i = 0; i < lines.length; i++) {
    if (/^\s*paths:\s*$/.test(lines[i])) {
        // Insert the include line after 'paths:'
        lines.splice(i + 1, 0, includeLine);
        break; // Only insert once
    }
}
updatedContent = lines.join('\n');
fs.writeFileSync(platformRoutesYamlFilePath, updatedContent, 'utf8');

console.log('routes.yaml processed successfully!');

// services.yaml --------------------
const platformServicesYamlFilePath = path.join(process.cwd(), '/.platform/services.yaml');

content = fs.readFileSync(platformServicesYamlFilePath, 'utf8');

updatedContent = content.replace(
    /^(\s*)disk:\s*\d+\s*$/m,
    '$1disk: !include project/site_specific/mysql.disk.yaml'
);

fs.writeFileSync(platformServicesYamlFilePath, updatedContent, 'utf8');

console.log('services.yaml processed successfully!');

// done
console.log('Site scaffolded successfully!');
