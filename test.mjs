import { getLoginToken, fetchTaskTokens} from './stfclogin.mjs';
import { getStoredLogins, storeLogins } from './stfctokens.mjs';
import { decrypt } from './stfccrypto.mjs';

import dotenv from 'dotenv'
dotenv.config()

// var taskTokens = JSON.parse(decrypt(await fetchTaskTokens()));
// Object.keys(taskTokens).forEach(function(key) {
//     process.env[key] = taskTokens[key];
// });

console.log("\n\nDate: "+Date());

var logins = JSON.parse(process.env.STFC_LOGINS);
var promises = [];
for(var i in logins) {
    var login = logins[i];
    promises.push(getLoginToken(login.email,login.password));
}
await Promise.all(promises).then(async(values) => {
    console.log("Got Tokens: \r\n"+JSON.stringify(values));
    await storeLogins(values);
    await getStoredLogins().then((logins) => {
        console.log("Got Stored Logins: \r\n"+JSON.stringify(logins));
    });
});
console.log("DONE\n");