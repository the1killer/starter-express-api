import getLoginToken from './stfclogin.mjs';
import dotenv from 'dotenv'
dotenv.config()

var logins = JSON.parse(process.env.STFC_LOGINS);
var token = await getLoginToken(logins[0].email,logins[0].password);
console.log("Got Token:"+token);