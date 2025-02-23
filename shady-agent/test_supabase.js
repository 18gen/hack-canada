require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase credentials missing in .env file!");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

(async () => {
  try {
    const { data, error } = await supabase.from("poll").select("*").limit(1);
    if (error) throw error;
    console.log("✅ Supabase Connection Successful:", data);
  } catch (err) {
    console.error("❌ Supabase Connection Error:", err);
  }
})();
