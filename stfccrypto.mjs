//Checking the crypto module
import * as crypto from 'crypto';
const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);

//Encrypting text
const encrypt = function(text) {
   let key = process.env.STFC_CRYPTO_KEY;
   let iv = crypto.randomBytes(16);
   let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

// Decrypting text
const decrypt = function(text) {
   let key = process.env.STFC_CRYPTO_KEY;
   let iv = Buffer.from(text.iv, 'hex');
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

export {encrypt, decrypt};