require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const seed = require('./src/seed');
const { client } = require('./src/db');

const brokenNames = [
  'ESDS Software Solution',
  'Electrosteel Steel Ltd',
  'Mohan Meakin',
  'Fusion Techstack Limited',
  'APL Metals',
  'ASK Investment Managers Ltd',
  'BLSX Limited',
  'BOAT',
  'Vivriti Capital',
  'Innov8 Coworking',
  'Vivriti AMC'
];

async function downloadLogo(domain, dest) {
  return new Promise((resolve) => {
    https.get(`https://logo.clearbit.com/${domain}`, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(true);
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

  for (const name of brokenNames) {
    const company = seed.UNLISTED.find(c => c.name === name);
    if (!company) continue;

    console.log(`Processing ${name} (${company.domain})...`);
    const success = await downloadLogo(company.domain, path.join(logosDir, `${name}.png`));
    
    let newLogoUrl = 'null';
    if (success) {
      console.log(`  Downloaded logo for ${name}`);
      newLogoUrl = `"/logos/${name}.png"`;
    } else {
      console.log(`  No logo found on Clearbit for ${name}`);
    }

    // Update seed.js
    const regex = new RegExp(`(name:\\s*"${name}".*?logo_url:\\s*)"[^"]+"`, 'g');
    seedContent = seedContent.replace(regex, `$1${newLogoUrl}`);

    // Update DB
    await client.from('unlisted_shares')
      .update({ logo_url: newLogoUrl === 'null' ? null : newLogoUrl.replace(/"/g, '') })
      .eq('name', name);
  }

  fs.writeFileSync('./src/seed.js', seedContent);
  console.log("Done.");
}

run();
