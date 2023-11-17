// apiRequest.js
import got from 'got';

const headers = {
    'authority': 'storeapi.startrekfleetcommand.com',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    'content-language': 'en',
    'content-type': 'application/json',
    'origin': 'https://home.startrekfleetcommand.com',
    'pragma': 'no-cache',
    'referer': 'https://home.startrekfleetcommand.com/',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const makeApiRequest = async (url, method = 'GET', customHeaders = {}, body = null) => {
  try {
    const combinedHeaders = {
        ...headers,
        ...customHeaders,
      };
    var options = {
      method: method,
      headers: combinedHeaders,
      responseType: 'json',
    };
    if(body != null) {
      options.json = body;
    }
    const response = await got(url, options);

    return response.body;
  } catch (error) {
    if (error.response && error.response.body) {
      console.error('Error Response Body:', error.response.body);
    }
    throw new Error(`Error making API request: ${error.message}`);
  }
};

export default makeApiRequest;