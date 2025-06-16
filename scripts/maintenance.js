const { execSync } = require('child_process');

/**
 * Create new git branch
 */

execSync('git branch --show-current', (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
    const branch = stdout.trim();
    if (branch === 'dev') {
        // Get current month and year
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = now.getFullYear();

        const branchName = `maintenance-${month}-${year}`;

        try {
            // Create and checkout the new branch
            execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
            console.log(`Switched to new branch: ${branchName}`);
        } catch (error) {
            console.error('Error creating or switching branch:', error.message);
        }
    } else {
        console.log(`Current branch is "${branch}", not "dev".`);
    }
});

/**
 * Sync starter
 */
execSync('git pull upstream master --allow-unrelated-histories', (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
});

/**
 * Run composer update script
 */
execSync('node ./scripts/composer_update.js', (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
});

/**
 * Git commit and push
 */
execSync('git add *', (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
});
execSync(`git commit -m "maintenance for ${month}/${year}"`, (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
});
execSync('git push' , (err, stdout, stderr) => {
    if (err) {
        console.error('Error running git command:', err);
        return;
    }
});
