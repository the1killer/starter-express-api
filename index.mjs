// import * as express from "express";
import express from 'express';
import makeApiRequest from "./stfcapi.mjs";
import dotenv from 'dotenv'
dotenv.config()

const app = express()

var tokens = JSON.parse(process.env.TOKENS);

app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})
app.all('/token', (req, res) => {
  console.log("Just got a token request!")
  console.log("token: ("+typeof(tokens)+") "+JSON.stringify(tokens))
  res.send('Yo ho!\n'+tokens.length)
})
app.get('/gifts', async (req,res) => {
    console.log("Just got a /gifts request!")
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
            if(ele.offer_details.valid_from == undefined && ele.title.includes("Loyalty Chest") == false) {
              toClaim[i].push({id:ele.bundle_id,name:ele.title});
            }
          });
        }
        
        res.json(toClaim);
      } catch (error) {
        console.error('Error:', error.message);
      }
})
app.get('/claimall', async (req,res) => {
  console.log("Just got a /claimall request!")
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
          if(ele.offer_details.valid_from == undefined && ele.title.includes("Loyalty Chest") == false) {
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
app.listen(process.env.PORT || 3000)