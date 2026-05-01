// ============================================================
// API: Engagement Heatmap — Phase 2.5
//
// GET /api/engagement-heatmap?group_id=...
//   Return heatmap data per (post_hour × post_dow) untuk 1 grup.
//
// GET /api/engagement-heatmap (no group_id)
//   Return list semua grup yang punya data engagement (untuk dropdown).
//
// Output:
//   {
//     groups: [{group_id, group_name, post_count}],   // kalau no group_id
//     cells:  [{post_hour, post_dow, post_count, avg_likes, avg_comments,
//               avg_shares, engagement_score}],         // kalau ada group_id
//     bestHours: [{hour, engagement_score, post_count}], // top 3
//   }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MIN_POSTS = 3; // minimal 3 post per (hour×dow) buat ranking

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('group_id');

    // List grup yang punya data engagement (untuk dropdown)
    if (!groupId) {
      const { data, error } = await supabase
        .from('engagement_log')
        .select('group_id, group_name')
        .not('last_check_at', 'is', null);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const groupMap = {};
      for (const row of data || []) {
        if (!groupMap[row.group_id]) {
          groupMap[row.group_id] = { group_id: row.group_id, group_name: row.group_name, post_count: 0 };
        }
        groupMap[row.group_id].post_count++;
      }
      const groupList = Object.values(groupMap)
        .sort((a, b) => b.post_count - a.post_count);

      return NextResponse.json({ groups: groupList });
    }

    // Heatmap data per group_id
    const { data: rows, error: errRows } = await supabase
      .from('engagement_log')
      .select('post_hour, post_dow, likes_count, comments_count, shares_count')
      .eq('group_id', groupId)
      .gte('posted_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
      .not('last_check_at', 'is', null);

    if (errRows) return NextResponse.json({ error: errRows.message }, { status: 500 });

    // Aggregate per (hour × dow)
    const buckets = {};
    for (const row of rows || []) {
      const key = `${row.post_hour}-${row.post_dow}`;
      if (!buckets[key]) {
        buckets[key] = {
          post_hour: row.post_hour,
          post_dow: row.post_dow,
          post_count: 0,
          total_likes: 0,
          total_comments: 0,
          total_shares: 0,
        };
      }
      const b = buckets[key];
      b.post_count++;
      b.total_likes += row.likes_count || 0;
      b.total_comments += row.comments_count || 0;
      b.total_shares += row.shares_count || 0;
    }

    const cells = Object.values(buckets).map(b => ({
      post_hour: b.post_hour,
      post_dow: b.post_dow,
      post_count: b.post_count,
      avg_likes: Math.round((b.total_likes / b.post_count) * 100) / 100,
      avg_comments: Math.round((b.total_comments / b.post_count) * 100) / 100,
      avg_shares: Math.round((b.total_shares / b.post_count) * 100) / 100,
      engagement_score: Math.round(((b.total_likes + b.total_comments * 2 + b.total_shares * 3) / b.post_count) * 100) / 100,
    }));

    // Top 3 best hours (aggregate across dow)
    const hourBuckets = {};
    for (const cell of cells) {
      if (!hourBuckets[cell.post_hour]) {
        hourBuckets[cell.post_hour] = { hour: cell.post_hour, total_score: 0, total_count: 0 };
      }
      hourBuckets[cell.post_hour].total_score += cell.engagement_score * cell.post_count;
      hourBuckets[cell.post_hour].total_count += cell.post_count;
    }
    const bestHours = Object.values(hourBuckets)
      .filter(h => h.total_count >= MIN_POSTS)
      .map(h => ({
        hour: h.hour,
        engagement_score: Math.round((h.total_score / h.total_count) * 100) / 100,
        post_count: h.total_count,
      }))
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 3);

    return NextResponse.json({ cells, bestHours });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
