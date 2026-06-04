const { fyersModel } = require("fyers-api-v3");
const fs = require('fs');

const token = JSON.parse(fs.readFileSync('./fyers_token.json')).access_token;
const appId = "K7S38ZHV3L-100";

const fyers = new fyersModel();
fyers.setAppId(appId);
fyers.setAccessToken(token);

async function run() {
  try {
    const res = await fyers.getQuotes(["NSE:RELIANCE-EQ", "NSE:TCS-EQ"]);
    console.log("QUOTES:", JSON.stringify(res, null, 2));
    
    const history = await fyers.getHistory({
      symbol: "NSE:RELIANCE-EQ",
      resolution: "1D",
      date_format: "1",
      range_from: "2024-05-01",
      range_to: "2024-06-04",
      cont_flag: "1"
    });
    console.log("HISTORY:", JSON.stringify(history, null, 2));
  } catch(e) {
    console.error(e);
  }
}
run();
