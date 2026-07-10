const https = require('https');
const fs = require('fs');

async function searchLogo(query) {
  return new Promise((resolve) => {
    https.get(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' logo')}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<img[^>]+src="([^"]+)"/g);
        console.log(`Results for ${query}:`);
        console.log(match ? match.slice(0, 3) : null);
        resolve();
      });
    });
  });
}

searchLogo("Bazar India");
