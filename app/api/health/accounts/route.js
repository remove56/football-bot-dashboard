/**
 * GET /api/health/accounts
 *
 * Return latest health snapshot per akun bot grup. Sort by health_score desc
 * supaya akun bermasalah (rest_now, danger) muncul di paling atas.
 */
import { createClient } from '@supabase/supabase-js';

// FORCE dynamic — jangan cache di Vercel CDN.
// Pause state akun bisa berubah tiap detik via dashboard tombol per-akun.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function GET() {
  try {
    // Ambil snapshot terbaru per account_id (lateral join workaround:
    // 1. distinct account_id, lalu fetch latest per akun)
    const { data: accounts } = await supabase.from('bot_accounts')
      .select('account_id, account_name, is_active, total_posts, paused, paused_at, paused_by, pause_reason')
      .eq('account_type', 'grup')
      .order('account_name');

    if (!accounts || accounts.length === 0) {
      return Response.json({ accounts: [], message: 'no accounts' });
    }

    // Fetch latest snapshot per akun
    const ids = accounts.map(a => a.account_id);
    const { data: snapshots } = await supabase.from('account_health_snapshots')
      .select('*')
      .in('account_id', ids)
      .order('snapshot_at', { ascending: false })
      .limit(500);

    // Map latest per account_id
    const latestByAcc = {};
    for (const s of snapshots || []) {
      if (!latestByAcc[s.account_id]) latestByAcc[s.account_id] = s;
    }

    const result = accounts.map(acc => {
      const snap = latestByAcc[acc.account_id];
      return {
        account_id: acc.account_id,
        account_name: acc.account_name,
        is_active: acc.is_active,
        total_posts: acc.total_posts,
        paused: !!acc.paused,
        paused_at: acc.paused_at,
        paused_by: acc.paused_by,
        pause_reason: acc.pause_reason,
        health_score: snap?.health_score ?? null,
        risk_tier: snap?.risk_tier ?? 'no_data',
        cookie_age_days: snap?.cookie_age_days ?? null,
        failure_rate_7d: snap?.failure_rate_7d ?? null,
        checkpoint_count_30d: snap?.checkpoint_count_30d ?? 0,
        avg_engagement_per_post: snap?.avg_engagement_per_post ?? 0,
        recommended_action: snap?.recommended_action ?? null,
        snapshot_at: snap?.snapshot_at ?? null,
      };
    });

    // Sort: rest_now → danger → caution → safe → no_data
    const tierOrder = { rest_now: 0, danger: 1, caution: 2, safe: 3, no_data: 4 };
    result.sort((a, b) => (tierOrder[a.risk_tier] ?? 5) - (tierOrder[b.risk_tier] ?? 5));

    return Response.json({ accounts: result, generated_at: new Date().toISOString() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
