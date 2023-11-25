import puppeteer from 'puppeteer';
import AWS from 'aws-sdk';
import * as jose from 'jose';

import { encrypt, decrypt } from './stfccrypto.mjs';
const s3 = new AWS.S3()

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

const storeLogins = async(data) => {
    var bucket = process.env.STFC_S3_BUCKET;
    var file = process.env.STFC_CREDENTIAL_FILE;
    var encrypted = [];
    for(var i in data) {
        encrypted[i] = encrypt(data[i]);
    }
    await s3.putObject({
        Body: JSON.stringify(encrypted),
        Bucket: bucket,
        Key: file,
    }).promise()
}

const getStoredLogins = async() => {
    var bucket = process.env.STFC_S3_BUCKET;
    var file = process.env.STFC_CREDENTIAL_FILE;
    let my_file = await s3.getObject({
        Bucket: bucket,
        Key: file,
    }).promise()
    var encrypted = JSON.parse(my_file.Body.toString());
    var decrypted = [];
    for(var i in encrypted) {
        decrypted[i] = decrypt(encrypted[i]);
    }
    return decrypted;
}

const needNewTokens = (tokens) => {
    var needNew = false;
    for(var i in tokens) {
        var token = tokens[i];
        const claims = jose.decodeJwt(token)
        console.log("Token "+i+" issued at: "+claims.iat+" vs ("+Date.now()/1000+")",Date.now()/1000-claims.iat);
        if(Date.now()/1000-claims.iat > 86400) {
            needNew = true;
            break;
        }
    }
    return needNew;
}
export { getTokens, getLoginToken, storeLogins, getStoredLogins , needNewTokens};