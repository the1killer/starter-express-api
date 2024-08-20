import { getLoginToken, fetchTaskTokens} from './stfclogin.mjs';
import { getStoredLogins, storeLogins } from './stfctokens.mjs';
import { decrypt, encrypt } from './stfccrypto.mjs';
import { getTokens, updateTokens } from './stfcaws.mjs';

import dotenv from 'dotenv'
dotenv.config()

console.log("\n\nDate: "+Date());

var logins = JSON.parse(process.env.STFC_LOGINS);
var promises = [];
for(var i in logins) {
    var login = logins[i];
    promises.push(getLoginToken(login.email,login.password));
}
await Promise.all(promises).then(async(values) => {
    // console.log("Got Tokens: \r\n"+JSON.stringify(values));
    console.log("Got Tokens: \r\n"+values.length);
    var encrypted = [];
    for(var i in values) {
        encrypted[i] = encrypt(values[i]);
    }
    var result = await updateTokens(encrypted);
    // console.log("Updated tokens: "+JSON.stringify(result));
    console.log("Updated tokens: "+result.length);
});

// var f = await getTokens();
// console.log(f);

console.log("DONE\n");