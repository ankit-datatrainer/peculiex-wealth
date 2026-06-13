require('dotenv').config();
const { client } = require('./src/db');
const seed = require('./src/seed');

async function run() {
  if (!client) {
    console.error("No Supabase client connected. Missing URL/Key.");
    process.exit(1);
  }
  
  console.log("Clearing existing unlisted shares...");
  const { error: delError } = await client.from('unlisted_shares').delete().neq('name', 'dummy_nonexistent');
  if (delError) {
    console.error("Failed to clear table:", delError);
    process.exit(1);
  }
  
  console.log("Inserting new unlisted shares from seed...");
  const { error: insError } = await client.from('unlisted_shares').insert(seed.UNLISTED);
  if (insError) {
    console.error("Failed to insert shares:", insError);
    process.exit(1);
  }
  
  console.log("Migration complete!");
  process.exit(0);
}

run();
