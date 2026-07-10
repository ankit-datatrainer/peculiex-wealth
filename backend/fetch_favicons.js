require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const seed = require('./src/seed');
const { client } = require('./src/db');

const missingNames = [
  'Power Exchange India Limited (PXIL)',
  'ESDS Software Solution',
  'Electrosteel Steel Ltd',
  'Mohan Meakin',
  'Fusion Techstack Limited',
  'Utkarsh Micro Finance (Core Invest)',
  'ASK Investment Managers Ltd',
  'Bazar India',
  'Bharat Hotels',
  'Bharat Nidhi (Bharat Bank)',
  'BLSX Limited',
  'BOAT',
  'Bolzen and Mutter',
  'Innov8 Workspaces India Limited',
  'Vivriti Capital',
  'Innov8 Coworking',
  'Vivriti AMC'
];

async function downloadLogo(domain, dest) {
  return new Promise((resolve) => {
    // using Google favicon service
    const url = `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        // check content type to ensure it's actually an image
        if (!res.headers['content-type'].startsWith('image/')) {
          res.resume();
          return resolve(false);
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          // Verify file is not suspiciously small (like 0 bytes or empty fallback)
          const stats = fs.statSync(dest);
          if (stats.size < 100) {
             fs.unlinkSync(dest);
             resolve(false);
          } else {
             resolve(true);
          }
        });
      } else {
        res.resume();
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function run() {
  const logosDir = path.join(__dirname, '../frontend/public/logos');
  let seedContent = fs.readFileSync('./src/seed.js', 'utf8');

  for (const name of missingNames) {
    const company = seed.UNLISTED.find(c => c.name === name);
    if (!company) continue;
    
    // clean up name for filesystem
    const safeName = name.replace(/[^a-zA-Z0-9 ()-]/g, '');
    const dest = path.join(logosDir, `${safeName}.png`);

    console.log(`Processing ${name} (${company.domain})...`);
    const success = await downloadLogo(company.domain, dest);
    
    if (success) {
      console.log(`  Downloaded logo for ${name}`);
      const newLogoUrl = `"/logos/${safeName}.png"`;
      
      // Update seed.js
      const regex = new RegExp(`(name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}".*?logo_url:\\s*)[^,\\n]+`, 'g');
      seedContent = seedContent.replace(regex, `$1${newLogoUrl}`);

      // Update DB
      await client.from('unlisted_shares')
        .update({ logo_url: newLogoUrl.replace(/"/g, '') })
        .eq('name', name);
    } else {
      console.log(`  No logo found for ${name}`);
    }
  }

  fs.writeFileSync('./src/seed.js', seedContent);
  console.log("Done.");
}

run();
