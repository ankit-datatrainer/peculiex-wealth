const https = require('https');
const fs = require('fs');

https.get('https://html.duckduckgo.com/html/?q=apl+metals+limited+logo', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<img[^>]+src="([^"]+)"/g);
    console.log("Matches:", match ? match.slice(0, 5) : null);
  });
});
