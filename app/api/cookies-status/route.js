// ============================================================
// API: Cookies Status — Phase 6.2
//
// GET /api/cookies-status
//   Return semua akun bot grup dgn status cookies (refresh time, xs expiry,
//   last validation result). Dipakai untuk tab "🍪 Cookies" di dashboard.
//
// Output per account:
//   {
//     id, name, paused, pause_reason,
//     cookies_refreshed_at, cookies_xs_expires_at, cookies_last_validated_at,
//     cookies_last_validation_result,
//     file_age_days, xs_expires_in_hours,
//     status: 'ok' | 'aging' | 'urgent' | 'expired' | 'invalid' | 'paused'
//   }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function classifyStatus(acc, now) {
  if (acc.paused) {
    if (acc.cookies_last_validation_result === 'invalid') return 'invalid';
    return 'paused';
  }
  if (acc.cookies_xs_expires_at) {
    const xsExpire = new Date(acc.cookies_xs_expires_at).getTime();
    if (xsExpire < now) return 'expired';
    if (xsExpire - now < 24 * 60 * 60 * 1000) return 'urgent';
  }
  if (acc.cookies_refreshed_at) {
    const ageDays = (now - new Date(acc.cookies_refreshed_at).getTime()) / 86400000;
    if (ageDays > 20) return 'urgent';
    if (ageDays > 14) return 'aging';
  }
  return 'ok';
}

export async function GET() {
  try {
    const { data: accs, error } = await supabase
      .from('bot_accounts')
      .select(
        'account_id, account_name, paused, paused_at, pause_reason, '
        + 'total_posts, last_post_at, '
        + 'cookies_refreshed_at, cookies_xs_expires_at, '
        + 'cookies_last_validated_at, cookies_last_validation_result'
      )
      .eq('is_active', true)
      .eq('account_type', 'grup')
      .order('account_name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const now = Date.now();
    const enriched = (accs || []).map(a => {
      const fileAgeDays = a.cookies_refreshed_at
        ? (now - new Date(a.cookies_refreshed_at).getTime()) / 86400000
        : null;
      const xsExpiresInHours = a.cookies_xs_expires_at
        ? (new Date(a.cookies_xs_expires_at).getTime() - now) / 3600000
        : null;
      return {
        id: a.account_id,
        name: a.account_name,
        paused: a.paused,
        pause_reason: a.pause_reason,
        paused_at: a.paused_at,
        total_posts: a.total_posts,
        last_post_at: a.last_post_at,
        cookies_refreshed_at: a.cookies_refreshed_at,
        cookies_xs_expires_at: a.cookies_xs_expires_at,
        cookies_last_validated_at: a.cookies_last_validated_at,
        cookies_last_validation_result: a.cookies_last_validation_result,
        file_age_days: fileAgeDays !== null ? Number(fileAgeDays.toFixed(1)) : null,
        xs_expires_in_hours: xsExpiresInHours !== null ? Number(xsExpiresInHours.toFixed(1)) : null,
        xs_expires_in_days: xsExpiresInHours !== null ? Number((xsExpiresInHours / 24).toFixed(1)) : null,
        status: classifyStatus(a, now),
      };
    });

    const stats = {
      total: enriched.length,
      ok: enriched.filter(a => a.status === 'ok').length,
      aging: enriched.filter(a => a.status === 'aging').length,
      urgent: enriched.filter(a => a.status === 'urgent').length,
      expired: enriched.filter(a => a.status === 'expired').length,
      invalid: enriched.filter(a => a.status === 'invalid').length,
      paused: enriched.filter(a => a.status === 'paused').length,
    };

    return NextResponse.json({
      updated_at: new Date().toISOString(),
      accounts: enriched,
      stats,
    }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
