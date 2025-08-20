const puppeteer = require("puppeteer");
const percySnapshot = require("@percy/puppeteer");
const scrollToBottom = require("scroll-to-bottomjs");
const { execSync } = require("child_process");

let site = execSync(
	"~/.platformsh/bin/platform environment:info edge_hostname"
);
let siteFull = `https://${site}`;

(async () => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const scrollOptions = {
		frequency: 100,
		timing: 200, // milliseconds
	};

	// Home Page
	const homePage = await browser.newPage();
	await homePage.goto(`${siteFull}/`);
	await new Promise(function (resolve) {
		setTimeout(async function () {
			await homePage.evaluate(scrollToBottom, scrollOptions);
			await percySnapshot(homePage, "Snapshot of test page");
			resolve();
		}, 3000);
	});

	await browser.close();
})();
