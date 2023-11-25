import { getLoginToken, storeLogins, getStoredLogins} from './stfclogin.mjs';
import dotenv from 'dotenv'
dotenv.config()

var logins = JSON.parse(process.env.STFC_LOGINS);
var tokens = [];
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