// ============================================================
// THE LAB — CONFIG
// ============================================================
// Fill in the two values below with your own Supabase details.
//
// Where to find them:
// 1. Open your Supabase project
// 2. Click the gear icon (⚙️ Settings) in the left sidebar
// 3. Click "API"
// 4. Copy "Project URL" -> paste it as SUPABASE_URL below
// 5. Copy the "anon" "public" key (long string starting eyJ...)
//    -> paste it as SUPABASE_ANON_KEY below
//
// This key is SAFE to be in this file / visible in the browser.
// It's the "public" key — it only works within the security
// rules (RLS policies) we set up in schema.sql. NEVER put your
// "service_role" key here or in any file that ships to the browser.
// ============================================================

const SUPABASE_URL = 'https://YOUR-PROJECT-ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY-GOES-HERE';

// Don't edit below this line — this creates the connection
// that every page uses to talk to your database.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
