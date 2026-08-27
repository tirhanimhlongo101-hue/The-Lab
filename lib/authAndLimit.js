// ============================================================
// /api/_lib/authAndLimit.js
// ============================================================
// Shared by both AI endpoints. Two jobs:
//  1. Prove the request came from a real logged-in user
//     (rejects anonymous/curl-from-anywhere requests)
//  2. Enforce a daily cap per user so nobody — including a
//     legitimate but compromised or careless account — can
//     rack up unlimited AI spend
//
// Uses the SERVICE ROLE key, which is only ever read here,
// server-side. This function is never sent to the browser.
// ============================================================

import { createClient } from '@supabase/supabase-js';

const DAILY_AI_LIMIT = 30; // adjust to taste once you know real usage patterns

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function authAndCheckLimit(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return { ok: false, status: 401, error: 'Missing Authorization header — log in first.' };
  }

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: 'Invalid or expired session.' };
  }
  const userId = userData.user.id;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countErr } = await supabaseAdmin
    .from('ai_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if (countErr) {
    console.error('Rate limit check failed:', countErr);
    return { ok: false, status: 500, error: 'Server error checking usage.' };
  }
  if ((count || 0) >= DAILY_AI_LIMIT) {
    return { ok: false, status: 429, error: `Daily AI limit reached (${DAILY_AI_LIMIT}/day). Try again tomorrow.` };
  }

  const { error: insertErr } = await supabaseAdmin
    .from('ai_usage')
    .insert({ user_id: userId });
  if (insertErr) {
    console.error('Could not record AI usage:', insertErr);
    // Fail closed would block real users on a transient DB hiccup — we
    // choose to let the request through here rather than break the
    // feature entirely, since the abuse case (this insert itself failing
    // repeatedly) is much rarer than a brief connection blip.
  }

  return { ok: true, userId };
}
