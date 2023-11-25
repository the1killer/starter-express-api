import puppeteer from 'puppeteer';
import { storeLogins } from './stfctokens.mjs';

const storeUrl = 'https://home.startrekfleetcommand.com/store';

const getTokens = async (logins) => {
    return new Promise(async(resolve, reject) => {
        var promises = [];
        for(var i in logins) {
            var login = logins[i];
            promises.push(getLoginToken(login.email,login.password));
        }
        await Promise.all(promises).then(async(values) => {
            console.log("Got Tokens: \r\n"+JSON.stringify(values));
            await storeLogins(values);
            resolve(values);
        });
    });
}

const getLoginToken = async (email,pass) => {
    return new Promise(async(resolve, reject) => {
        const browser = await puppeteer.launch({ headless: "new"});
        // const browser = await puppeteer.launch({ headless: false});
        const page = await browser.newPage();

        // console.log("Logging in with email: "+email+" and password: "+pass);

        await page.setRequestInterception(true);
        page.on('request', async(request) => {
            if(request.url().includes("https://storeapi.startrekfleetcommand.com/api/v2/offers/gifts") && request.method() == "GET") {
                console.log(request.url())
                // console.log(request.headers())
                if(request.headers().authorization != undefined) {
                    var headers = request.headers();
                    // console.log("Got token: "+headers.authorization.replace("Bearer ",""));

                    console.log("Clearing cache and cookies");
                    const client = await page.target().createCDPSession();
                    await client.send('Network.clearBrowserCookies');
                    await client.send('Network.clearBrowserCache');

                    console.log("Closing browser");
                    browser.close();

                    resolve(headers.authorization.replace("Bearer ",""));
                }
            }
            request.continue();
        });

        await page.goto(storeUrl);
        await page.waitForSelector('button[id="log-in-button"]').then(async() => {
            console.log("Clicking login button");
            await page.evaluate(() => {
                document.querySelector('button[id="log-in-button"]').click();
            });
        });
        await page.waitForSelector('input[name="email"]').then(async() => {
            console.log("Filling in email");
            await page.type('input[name="email"]', email);
            
            console.log("Clicking email continue button");
            await page.evaluate(() => {
                document.querySelector('button[data-test-id="site-email-input-submit-button"]').click();
            });
        });
        await page.waitForSelector('input[name="credentials.passcode"]').then(async() => {
            console.log("Filling in password");
            page.type('input[type="password"]', pass);
            
            await page.waitForTimeout(1000);
            console.log("Clicking submit login button");
            await page.evaluate(() => {
                document.querySelector('input[type="submit"]').click();
            });
        })
        await page.waitForSelector('button[id="store-web-gift-tab-button"]').then(() => {
            // page.$('button[id="store-web-gift-tab-button"]').click();
            console.log("Clicked on Gift tab");
        })
    });
};

export { getTokens, getLoginToken};