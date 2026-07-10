const fs = require('fs');
const path = require('path');
const seed = require('./src/seed');

const logosDir = path.join(__dirname, '../frontend/public/logos');
const logoFiles = fs.readdirSync(logosDir);

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findBestMatch(companyName) {
  const normName = normalize(companyName);
  
  // Try exact normalized match first
  let bestMatch = logoFiles.find(f => normalize(path.parse(f).name) === normName);
  if (bestMatch) return bestMatch;
  
  // Try inclusion (company name inside filename or vice versa)
  bestMatch = logoFiles.find(f => {
    const normFile = normalize(path.parse(f).name);
    return normFile.includes(normName) || normName.includes(normFile);
  });
  if (bestMatch) return bestMatch;
  
  // Try splitting words and counting matches
  const words = companyName.toLowerCase().split(/[\s\(\)&-]+/).filter(w => w.length > 2 && w !== 'ltd' && w !== 'pvt' && w !== 'limited');
  
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

function run() {
  const seedContent = fs.readFileSync(path.join(__dirname, 'src/seed.js'), 'utf8');
  let newSeedContent = seedContent;
  let updatedCount = 0;
  
  for (const company of seed.UNLISTED) {
     const match = findBestMatch(company.name);
     if (match) {
       const logoUrl = `/logos/${match}`;
       // Replace logo_url: "..." for this company
       if (company.logo_url !== logoUrl) {
         console.log(`Matched: ${company.name} -> ${logoUrl}`);
         const regex = new RegExp(`name:\\s*["']${company.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}["'].*?logo_url:\\s*["'].*?["']`, 'g');
         newSeedContent = newSeedContent.replace(regex, (matchStr) => {
           return matchStr.replace(/logo_url:\s*["'].*?["']/, `logo_url: "${logoUrl}"`);
         });
         updatedCount++;
       }
     } else {
       console.log(`No match for: ${company.name}`);
     }
  }
  
  fs.writeFileSync(path.join(__dirname, 'src/seed.js'), newSeedContent);
  console.log(`Wrote src/seed.js. Updated ${updatedCount} companies.`);
}

run();
