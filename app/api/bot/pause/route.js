/**
 * API: /api/bot/pause
 *
 * Toggle bot_paused flag di app_config table.
 * - GET: return current state
 * - POST: set state (body: { paused: bool, reason?: string, by?: string })
 *
 * Bot-worker poll flag ini tiap 30 detik (cache) dan skip task pickup kalau true.
 * Jadi pause efek-nya max 30 detik delay dari klik tombol.
 */
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function verifyAdmin(username) {
  if (!username) return false;
  const { data } = await supabase
    .from('users')
    .select('role, is_approved')
    .eq('username', String(username).trim().toLowerCase())
    .maybeSingle();
  return !!(data && data.role === 'admin' && data.is_approved !== false);
}

export async function GET() {
  try {
    const { data } = await supabase.from('app_config').select('value').eq('key', 'bot_paused').maybeSingle();
    return Response.json({
      paused: !!(data?.value?.paused),
      paused_at: data?.value?.paused_at || null,
      paused_by: data?.value?.paused_by || null,
      reason: data?.value?.reason || null,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const paused = !!body.paused;
    const reason = String(body.reason || '').substring(0, 500);
    const by = String(body.by || '').substring(0, 100);

    // SECURITY: verify caller is admin
    if (!(await verifyAdmin(by))) {
      return Response.json({ error: 'Unauthorized: admin role required' }, { status: 403 });
    }

    const newValue = paused
      ? { paused: true, paused_at: new Date().toISOString(), paused_by: by, reason }
      : { paused: false, paused_at: null, paused_by: null, reason: null };

    const { error } = await supabase.from('app_config')
      .upsert({ key: 'bot_paused', value: newValue }, { onConflict: 'key' });
    if (error) throw error;

    return Response.json({ success: true, ...newValue });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
