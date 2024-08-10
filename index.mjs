// import * as express from "express";
import express from 'express';
import dotenv from 'dotenv'
import serverless from 'serverless-http';

import { getStoredLogins, needNewTokens, getTaskTokens} from './stfctokens.mjs';
import makeApiRequest from "./stfcapi.mjs";
dotenv.config()

const app = express()

// var tokens = JSON.parse(process.env.TOKENS);

app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})
app.all('/token', async (req, res) => {
  console.log("Just got a token request!")
  var tokens = await getStoredLogins();
  console.log("token: ("+typeof(tokens)+") "+JSON.stringify(tokens))
  if(needNewTokens(tokens)) {
    console.log("NEED new tokens")
    res.send('You stinky!\n'+tokens.length)
  } else {
    res.send('Yo ho!\n'+tokens.length)
  }
})
app.get('/gifts', async (req,res) => {
    console.log("Just got a /gifts request!")
    var tokens = await getStoredLogins();
    var url = "https://storeapi.startrekfleetcommand.com/api/v2/offers/gifts";
    try {
        var toClaim = [];
        for(var i in tokens) {
          var customHeaders = {
            "authorization": `Bearer ${tokens[i]}`
          }
          const data = await makeApiRequest(url, 'GET', customHeaders);
          console.log('Data length('+i+"): ", data.length);
          // console.log('Data: ',data);
          toClaim[i] = []
          data.forEach(ele => {
            // if(ele.offer_details.valid_from == undefined && ele.title.includes("Loyalty Chest") == false) {
              toClaim[i].push({id:ele.bundle_id,name:ele.title});
            // }
          });
        }
        
        res.json(toClaim);
      } catch (error) {
        console.error('Error:', error.message);
      }
})
app.get('/claimall', async (req,res) => {
  console.log("Just got a /claimall request!")
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
      res.json(results);
    } catch (error) {
      console.error('Error:', error.message);
      res.sendStatus(500);
    }
})

app.get('/tasktoken', async (req,res) => {
  console.log("Just got a /tasktoken request!")
  res.json(await getTaskTokens());
});
// app.listen(process.env.PORT || 3000)

export const handler = serverless(app);