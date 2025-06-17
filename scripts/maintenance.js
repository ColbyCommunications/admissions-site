const { execSync } = require('child_process');

/**
 * Create new git branch
 */

const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();

if (branch === 'maint-test') {
    // Get current month and year
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = now.getFullYear();
    const day = now.getDate();

    const branchName = `maintenance-${month}-${day}-${year}`;

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

/**
 * Sync starter
 */
execSync('git pull upstream dev --allow-unrelated-histories', (err, stdout, stderr) => {
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
