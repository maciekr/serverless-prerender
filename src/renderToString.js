const URL = require("url");

exports.renderToString = async (browser, targetUrl) => {
	// Open a new browser page
    const page = await browser.newPage();
    // Set browser size to something decent, mobile mode often tricks websites into loading faster
    await page.setViewport({
        width: 1920,
        height: 1080,
        isMobile: true
    });
		
	// navigate to targetUrl page
	// wait for the page to load and stop making requests
	// The latter is important for modern SPAs that render after document is loaded
    const pageText = await page.goto(targetUrl, {
        waitUntil: ["domcontentloaded", "networkidle2"]
    }).then((response) => response.text());

    return pageText;
};