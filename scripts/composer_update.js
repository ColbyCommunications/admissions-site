const fs = require('fs');
const { execSync } = require('child_process');

const composerData = JSON.parse(fs.readFileSync('./project/global/composer.json'));

// console.log(composerData);
fs.readFile('./project/site_specific/composer_requirements.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error while reading the site specific json file:', err);
        return;
    }

    const siteRequirementsData = JSON.parse(data);
    composerData.require = { ...composerData.require, ...siteRequirementsData.require };

    const outputData = JSON.stringify(composerData, null, 2);

    fs.writeFile('composer.json', outputData, (err) => {
        if (err) {
            console.error('Error while writing the file:', err);
            return;
        }
        console.log('Successfully wrote to composer.json');
    });
});

execSync('rm -rf vendor');
execSync('rm composer.lock');
execSync('composer update');
