const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = process.cwd();
const composerData = JSON.parse(fs.readFileSync('./project/global/composer.json'));

if (fs.existsSync(path.join(projectRoot, 'composer.json'))) {
    execSync('rm composer.json');
}

fs.readFile('./project/site_specific/composer_requirements.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error while reading the site specific json file:', err);
        return;
    }

    const siteRequirementsData = JSON.parse(data);
    composerData.require = { ...composerData.require, ...siteRequirementsData.require };
    composerData.repositories = siteRequirementsData.repositories.concat(composerData.repositories);
    composerData.extra['installer-paths']['web/wp-content/mu-plugins/{$name}'] = composerData.extra[
        'installer-paths'
    ]['web/wp-content/mu-plugins/{$name}'].concat(
        siteRequirementsData.extra['installer-paths']['web/wp-content/mu-plugins/{$name}']
    );
    const outputData = JSON.stringify(composerData, null, 2);

    fs.writeFile('composer.json', outputData, (err) => {
        if (err) {
            console.error('Error while writing the file:', err);
            return;
        }
        console.log('Successfully wrote to composer.json');
        if (fs.existsSync(path.join(projectRoot, 'vendor'))) {
            execSync('rm -rf vendor');
        }
        if (fs.existsSync(path.join(projectRoot, 'composer.lock'))) {
            execSync('rm composer.lock');
        }

        execSync('composer update');
    });
});
