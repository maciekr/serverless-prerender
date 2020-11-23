const chromium = require('chrome-aws-lambda');

exports.handler = async(event, context, callback) => {

	let result = null;
	let browser = null;
	var headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Credentials": true,
		"access-control-allow-methods": "GET"
	};

	if (!event.queryStringParameters) {
		Object.assign(headers, {"Content-Type": "text/plain"})
		callback(null, {
			statusCode: 400,
			headers,
			body: "You need a url"
		});
	}

	try {
		browser = await chromium.puppeteer.launch({
			args: chromium.args,
			defaultViewport: chromium.defaultViewport,
			executablePath: await chromium.executablePath,
			headless: chromium.headless,
			ignoreHTTPSErrors: true,
		});
		console.log("chrome ready")

		let page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on('request', (req) => {
			if (req.resourceType() == 'font' || req.resourceType() == 'stylesheet' || req.resourceType() === 'image') {
				req.abort();
			} else {
				req.continue();
			}
		});

		console.log("got new page")
		const targetUrl = event.queryStringParameters.url;
		await page.goto(targetUrl, {
			waitUntil: ["domcontentloaded", "networkidle2"]
		})
		console.log("load the page")
		result = await page.evaluate(() => document.body.innerHTML);
		console.log("got the evaluate result")
		Object.assign(headers, {"Content-Type": "text/html"});
		return callback(null, {
			statusCode: 200,
			headers,
			body: result
		});

	} catch (error) {
		Object.assign(headers, {"Content-Type": "text/plain"});
		return callback(null, {
			statusCode: 500,
			headers,
			body: error
		});
	} finally {
		if (browser !== null) {
			await browser.close();
		}
	}
};
