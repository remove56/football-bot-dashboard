// ============================================================
// API: Matchday — Phase 5.1
//
// GET /api/matchday
//   Return semua grup yang matchday_card_ready=true, dengan info match
//   (home, away, kickoff, venue, competition) + akun bot yg assigned (kalau ada).
//
// Output:
//   {
//     updated_at: ISO,
//     fixtures: [{ match_id, home, away, kickoff, competition, venue }],
//     groups: [{
//       id, name, club, primary_account_id, primary_account_name,
//       card_path, match_info,
//       status: 'auto' | 'manual'
//     }],
//     stats: { total, auto, manual }
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

export async function GET() {
  try {
    const { data: groups, error } = await supabase
      .from('groups')
      .select(
        'id, name, club, primary_account_id, '
        + 'matchday_card_path, matchday_match_info, matchday_prepared_at'
      )
      .eq('matchday_card_ready', true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const accIds = [...new Set((groups || []).map(g => g.primary_account_id).filter(Boolean))];
    let accMap = {};
    if (accIds.length > 0) {
      const { data: accs } = await supabase
        .from('bot_accounts')
        .select('account_id, account_name')
        .in('account_id', accIds);
      accMap = Object.fromEntries((accs || []).map(a => [a.account_id, a.account_name]));
    }

    // Build per-fixture summary (unique by match_id)
    const fixturesMap = {};
    for (const g of groups || []) {
      const info = g.matchday_match_info;
      if (!info?.match_id) continue;
      if (!fixturesMap[info.match_id]) {
        fixturesMap[info.match_id] = {
          match_id: info.match_id,
          home: info.home,
          away: info.away,
          kickoff: info.kickoff,
          competition: info.competition,
          venue: info.venue,
        };
      }
    }
    const fixtures = Object.values(fixturesMap)
      .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));

    // User preference 2026-05-16: SEMUA grup status = 'manual'.
    // Auto-post (push ke task_queue) di-disable. Marker pure visibility tool.
    // primary_account_id tetap di-include sebagai info "saran akun bot yg member",
    // tapi tidak otomatis post — user post manual pakai akun pilihan sendiri.
    const enrichedGroups = (groups || []).map(g => ({
      id: g.id,
      name: g.name,
      club: g.club,
      suggested_account_id: g.primary_account_id,
      suggested_account_name: g.primary_account_id ? (accMap[g.primary_account_id] || null) : null,
      card_path: g.matchday_card_path,
      card_url: g.matchday_match_info?.card_url || null, // Phase 5.2: storage URL
      match_info: g.matchday_match_info,
      prepared_at: g.matchday_prepared_at,
      status: 'manual',
    })).sort((a, b) => {
      const ak = a.match_info?.kickoff || '';
      const bk = b.match_info?.kickoff || '';
      return new Date(ak) - new Date(bk);
    });

    const stats = {
      total: enrichedGroups.length,
      with_suggested_account: enrichedGroups.filter(g => g.suggested_account_id).length,
      no_suggested_account: enrichedGroups.filter(g => !g.suggested_account_id).length,
    };

    return NextResponse.json({
      updated_at: new Date().toISOString(),
      api_version: '5.2.2',
      fixtures,
      groups: enrichedGroups,
      stats,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'CDN-Cache-Control': 'no-store',
        'Vercel-CDN-Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
