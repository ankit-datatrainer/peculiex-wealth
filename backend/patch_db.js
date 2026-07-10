require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { client } = require('./src/db');
const seed = require('./src/seed');

const logosDir = path.join(__dirname, '../frontend/public/logos');
const logoFiles = fs.readdirSync(logosDir);

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findBestMatch(companyName) {
  const normName = normalize(companyName);
  
  let bestMatch = logoFiles.find(f => normalize(path.parse(f).name) === normName);
  if (bestMatch) return bestMatch;
  
  bestMatch = logoFiles.find(f => {
    const normFile = normalize(path.parse(f).name);
    return normFile.includes(normName) || normName.includes(normFile);
  });
  if (bestMatch) return bestMatch;
  
  const words = companyName.toLowerCase().split(/[\s\(\)&-]+/).filter(w => w.length > 2 && w !== 'ltd' && w !== 'pvt' && w !== 'limited' && w !== 'india' && w !== 'finance' && w !== 'limited');
  
  let maxScore = 0;
  for (const f of logoFiles) {
    const fWords = path.parse(f).name.toLowerCase().split(/[\s\(\)&-]+/);
    let score = 0;
    for (const w of words) {
      if (fWords.includes(w)) score++;
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = f;
    }
  }
  
  if (maxScore > 0) return bestMatch;
  return null;
}

async function run() {
  console.log("Fetching DB...");
  const { data: dbCompanies, error } = await client.from("unlisted_shares").select("*");
  if (error) {
    console.error(error);
    return;
  }
  
  let updatedCount = 0;
  for (const company of dbCompanies) {
    // We already manually patched seed.js correctly!
    // So we can just use seed.js as the source of truth for the logo URL.
    const seedCompany = seed.UNLISTED.find(s => s.name === company.name);
    if (seedCompany) {
       if (company.logo_url !== seedCompany.logo_url) {
          console.log(`Updating ${company.name} DB logo to ${seedCompany.logo_url}`);
          await client.from("unlisted_shares").update({ logo_url: seedCompany.logo_url }).eq("id", company.id);
          updatedCount++;
       }
    }
  }
  
  console.log(`Updated ${updatedCount} companies in DB.`);
}

run();
