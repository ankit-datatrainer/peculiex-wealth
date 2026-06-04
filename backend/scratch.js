const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({
    connectionString: 'postgresql://postgres:SCZWWqJODW9mYKNU@db.nmogkyjdlgktdtroiqyh.supabase.co:5432/postgres'
  });

  try {
    console.log("Connecting to Supabase...");
    await client.connect();
    
    console.log("Reading schema.sql...");
    const schema = fs.readFileSync('sql/schema.sql', 'utf8');
    await client.query(schema);
    console.log("Schema executed successfully.");

    console.log("Reading seed.sql...");
    const seed = fs.readFileSync('sql/seed.sql', 'utf8');
    await client.query(seed);
    console.log("Seed executed successfully.");

  } catch (err) {
    console.error("Error executing scripts:", err);
  } finally {
    await client.end();
  }
}

run();
