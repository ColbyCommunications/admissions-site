const fs = require('fs');
const { execSync } = require('child_process');

const npmData = JSON.parse(fs.readFileSync('./project/global/npm_requirements.json'));

// console.log(composerData);
fs.readFile('./project/site_specific/package.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error while reading the site specific json file:', err);
        return;
    }

    const siteRequirementsData = JSON.parse(data);
    siteRequirementsData.dependencies = {
        ...siteRequirementsData.dependencies,
        ...npmData.dependencies,
    };
    siteRequirementsData.devDependencies = {
        ...siteRequirementsData.devDependencies,
        ...npmData.devDependencies,
    };
    siteRequirementsData.scripts = {
        ...siteRequirementsData.scripts,
        ...npmData.scripts,
    };

    const outputData = JSON.stringify(siteRequirementsData, null, 2);

    fs.writeFile('package.json', outputData, (err) => {
        if (err) {
            console.error('Error while writing the file:', err);
            return;
        }
        console.log('Successfully wrote to package.json');
    });
});
execSync('rm -rf node_modules');
execSync('rm package-lock.json');
execSync('npm install');
