const https = require('https');
const fs = require('fs');

const url = 'https://cdn.brandfetch.io/askfinancials.com';
https.get(url, res => {
  console.log("Status:", res.statusCode);
  console.log("Content-Type:", res.headers['content-type']);
  if(res.statusCode === 200 && res.headers['content-type'].startsWith('image/')) {
      const file = fs.createWriteStream('test_logo.png');
      res.pipe(file);
      file.on('finish', () => console.log('Downloaded test_logo.png'));
  }
});
