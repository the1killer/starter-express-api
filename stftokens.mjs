import AWS from 'aws-sdk';
import * as jose from 'jose';


import { encrypt, decrypt } from './stfccrypto.mjs';
const s3 = new AWS.S3()

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

export { storeLogins, getStoredLogins , needNewTokens };