const fs = require('fs');
const token = JSON.parse(fs.readFileSync('./fyers_token.json')).access_token;
const appId = "K7S38ZHV3L-100";

async function run() {
  const res = await fetch(`https://api.fyers.in/data/quotes?symbols=NSE:RELIANCE-EQ,NSE:TCS-EQ`, {
    headers: { Authorization: `${appId}:${token}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
