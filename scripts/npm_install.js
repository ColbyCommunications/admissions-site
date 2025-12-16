const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectRoot = process.cwd();
const npmData = JSON.parse(fs.readFileSync('./project/global/npm_requirements.json'));

if (fs.existsSync(path.join(projectRoot, 'package.json'))) {
    execSync('rm package.json');
}

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

    const outputData = JSON.stringify(siteRequirementsData, null, 4);

    fs.writeFile('package.json', outputData, (err) => {
        if (err) {
            console.error('Error while writing the file:', err);
            return;
        }
        console.log('Successfully wrote to package.json');
        if (fs.existsSync(path.join(projectRoot, 'node_modules'))) {
            execSync('rm -rf node_modules');
        }
        if (fs.existsSync(path.join(projectRoot, 'package-lock.json'))) {
            execSync('rm package-lock.json');
        }

        execSync('npm install');
    });
});
