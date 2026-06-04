"use strict";

const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;
if (url && serviceKey) {
  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  // eslint-disable-next-line no-console
  console.log("[supabase] connected:", url);
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing — running in seed-only mode."
  );
}

const isLive = () => client !== null;

module.exports = { client, isLive };
