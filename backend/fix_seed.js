const fs = require('fs');
let c = fs.readFileSync('./src/seed.js', 'utf8');
c = c.replace(/logo_url:\s*["'][^"']*companylogocompany_logo[^"']*["']/g, match => {
  if (match.includes('1764753736')) {
    return 'logo_url: "/logos/APL Metals.png"';
  }
  return 'logo_url: null';
});
fs.writeFileSync('./src/seed.js', c);
console.log("Done updating seed.js");
