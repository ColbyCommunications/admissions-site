const puppeteer = require("puppeteer");
const percySnapshot = require("@percy/puppeteer");
const scrollToBottom = require("scroll-to-bottomjs");
const { execSync } = require("child_process");

// --- 1. The Reusable Login Routine (Mimics Cypress before()) ---
async function loginToWordPress(page, siteUrl) {
	// Check if env vars are present to avoid hanging
	if (!process.env.WP_USERNAME || !process.env.WP_PASSWORD) {
		throw new Error(
			"WP_USERNAME and WP_PASSWORD environment variables are missing!"
		);
	}
	console.log(`${siteUrl}/wp/wp-admin/`);
	// cy.visit('/wp/wp-admin/')
	await page.goto(`${siteUrl}/wp/wp-admin/`, { waitUntil: "networkidle2" });

	// cy.get('#user_login').type(...)
	await page.type("#user_login", process.env.WP_USERNAME);

	// cy.get('#user_pass').type(...)
	await page.type("#user_pass", process.env.WP_PASSWORD);

	// cy.get('#wp-submit').click()
	// Puppeteer requires us to explicitly wait for the navigation to complete after a click
	await Promise.all([
		page.waitForNavigation({ waitUntil: "networkidle2" }),
		page.click("#wp-submit"),
	]);

	console.log("Login successful.");
}

// --- Your Existing Setup Code ---
const branch = execSync("git rev-parse --abbrev-ref HEAD", {
	encoding: "utf8",
}).trim();
let site;
if (branch === "master") {
	site = execSync("~/.platformsh/bin/platform environment:info default_domain");
} else {
	site = execSync("~/.platformsh/bin/platform environment:info edge_hostname");
}
let siteFull = `https://${site}`;

(async () => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const scrollOptions = { frequency: 100, timing: 200 };
	const testPage = await browser.newPage();

	// 2. Navigate to the test page (now logged in)
	await testPage.setUserAgent("colby-github");

	// 1. Run the Login Routine
	// This sets the cookies in the local Puppeteer browser
	await loginToWordPress(testPage, siteFull);

	await testPage.goto(`${siteFull}/test-page`);

	// 3. Capture Cookies to share with Percy
	// This ensures Percy's asset discovery browser is ALSO logged in
	const sessionCookies = await testPage.cookies();

	await new Promise(function (resolve) {
		setTimeout(async function () {
			await testPage.evaluate(scrollToBottom, scrollOptions);

			// 4. Take Snapshot with Cookie Injection
			await percySnapshot(testPage, "Snapshot of test page", {
				discovery: {
					cookies: sessionCookies,
				},
			});
			resolve();
		}, 3000);
	});

	await browser.close();
})();
