require('dotenv').config();
const { client } = require('./src/db');
const seed = require('./src/seed');

async function run() {
  for (const company of seed.UNLISTED) {
    await client.from('unlisted_shares')
      .update({ logo_url: company.logo_url })
      .eq('name', company.name);
  }
  console.log("DB Updated");
}
run();
