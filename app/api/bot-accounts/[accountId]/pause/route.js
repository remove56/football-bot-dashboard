/**
 * API: /api/bot-accounts/[accountId]/pause
 *
 * Per-account pause toggle. Tiap akun bot punya pause SENDIRI (independent
 * dari global bot_paused di app_config).
 *
 * Use case: natural anti-detection — atur jadwal tidur/aktif beda per akun
 * supaya 16 akun terlihat seperti 16 manusia berbeda dengan jadwal beda.
 *
 * GET: return current state per akun
 * POST { paused, by, reason }: set pause state
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function GET(req, { params }) {
  try {
    const accountId = params?.accountId;
    if (!accountId) return Response.json({ error: 'accountId required' }, { status: 400 });

    const { data, error } = await supabase.from('bot_accounts')
      .select('account_id, account_name, paused, paused_at, paused_by, pause_reason')
      .eq('account_id', accountId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: 'account not found' }, { status: 404 });

    return Response.json({
      account_id: data.account_id,
      account_name: data.account_name,
      paused: !!data.paused,
      paused_at: data.paused_at,
      paused_by: data.paused_by,
      pause_reason: data.pause_reason,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const accountId = params?.accountId;
    if (!accountId) return Response.json({ error: 'accountId required' }, { status: 400 });

    const body = await req.json();
    const paused = !!body.paused;
    const reason = String(body.reason || '').substring(0, 500);
    const by = String(body.by || 'admin').substring(0, 100);

    const updates = paused
      ? { paused: true, paused_at: new Date().toISOString(), paused_by: by, pause_reason: reason }
      : { paused: false, paused_at: null, paused_by: null, pause_reason: null };

    const { data, error } = await supabase.from('bot_accounts')
      .update(updates)
      .eq('account_id', accountId)
      .select('account_id, account_name, paused, paused_at, paused_by, pause_reason')
      .maybeSingle();
    if (error) throw error;
    if (!data) return Response.json({ error: 'account not found' }, { status: 404 });

    return Response.json({ success: true, ...data });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
