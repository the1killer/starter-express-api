import dotenv from 'dotenv'

import { getStoredLogins, needNewTokens, getTaskTokens} from './stfctokens.mjs';
import makeApiRequest from "./stfcapi.mjs";
dotenv.config()

console.log("\n\nDate: "+Date());

var tokens = [];
try{
    tokens = await getStoredLogins();
    if(needNewTokens(tokens)) {
        console.log("NEED new tokens")
        // tokens = await getTokens(JSON.parse(process.env.STFC_LOGINS));
    }
} catch(e) {
console.log("Error getting tokens: "+e);
// tokens = await getTokens(logins);
}
var url = "https://storeapi.startrekfleetcommand.com/api/v2/offers/gifts";
try {
    var results = [];
    for(var i in tokens) {
        results[i] = [];
        var toClaim = [];
        var customHeaders = {
            "authorization": `Bearer ${tokens[i]}`
        }
        const data = await makeApiRequest(url, 'GET', customHeaders);
        console.log('Data length('+i+"): ", data.length);
        // console.log('Data: ',data);
        toClaim = []
        data.forEach(ele => {
            if(ele.offer_details.valid_from == undefined 
                && ele.title.includes("Loyalty Chest") == false 
                && ele.title.includes("Avatar Exchange") == false
                && ele.title.includes("Rush") == false
            ) {
            toClaim.push({id:ele.bundle_id,name:ele.title});
            }
        });

        if(toClaim.length == 0) {
            results[i].push("No gifts available to claim");
            continue;
        }
        console.log(`Claiming [${i}] ${toClaim.length} gifts`);
        var claimUrl = "https://storeapi.startrekfleetcommand.com/api/v2/offers/gifts/claim"
        
        for (const j in toClaim) {
            const cl = toClaim[j];
            console.log("Claiming "+JSON.stringify(cl));
            var body = { "bundleId": cl.id };
            const claimed = await makeApiRequest(claimUrl, 'POST', customHeaders, body);
            console.log(claimed);
            results[i].push(`Claimed [${i}] ${cl.id}: ${cl.name}`);
        }
    }
    console.log("Results: ",JSON.stringify(results));
} catch (error) {
    console.error('Error:', error.message);
    
}