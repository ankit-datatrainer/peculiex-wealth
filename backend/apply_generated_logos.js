require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { client } = require('./src/db');

const mapping = {
  'Power Exchange India Limited (PXIL)': 'powerexchange_1783643549475.png',
  'Electrosteel Steel Ltd': 'electrosteel_1783643559109.png',
  'Fusion Techstack Limited': 'fusiontechstack_1783643567505.png',
  'Utkarsh Micro Finance (Core Invest)': 'utkarshmicrofinance_1783643575785.png',
  'ASK Investment Managers Ltd': 'askinvestment_1783643583843.png',
  'Bazar India': 'bazarindia_1783643592033.png',
  'Bharat Hotels': 'bharathotels_1783643600083.png',
  'Bharat Nidhi (Bharat Bank)': 'bharatnidhi_1783643608123.png',
  'BLSX Limited': 'blsxlimited_1783643616292.png',
  'Bolzen and Mutter': 'bolzenandmutter_1783643627901.png'
};

async function run() {
  const artifactsDir = 'C:\\Users\\ankit\\.gemini\\antigravity-ide\\brain\\034b8bd7-fd6a-43d7-a610-527a17d10d61';
  const logosDir = path.join(__dirname, '../frontend/public/logos');
  let seedContent = fs.readFileSync('./src/seed.js', 'utf8');

  for (const [name, imgFile] of Object.entries(mapping)) {
    const src = path.join(artifactsDir, imgFile);
    
    // clean up name for filesystem
    const safeName = name.replace(/[^a-zA-Z0-9 ()-]/g, '');
    const destName = `${safeName}.png`;
    const dest = path.join(logosDir, destName);

    console.log(`Copying ${imgFile} to ${destName}...`);
    fs.copyFileSync(src, dest);
    
    const newLogoUrl = `"/logos/${destName}"`;
    
    // Update seed.js
    const regex = new RegExp(`(name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}".*?logo_url:\\s*)[^,\\n]+`, 'g');
    seedContent = seedContent.replace(regex, `$1${newLogoUrl}`);

    // Update DB
    await client.from('unlisted_shares')
      .update({ logo_url: newLogoUrl.replace(/"/g, '') })
      .eq('name', name);
  }

  fs.writeFileSync('./src/seed.js', seedContent);
  console.log("Done.");
}

run();
