// ============================================================
// API: Caption A/B Analysis — Phase 4.2
//
// GET /api/caption-ab
//   Return template_id ranking (top performers + worst performers)
//   based on average engagement dari caption_ab_analysis view.
//
// Output:
//   {
//     templates:  [{template_id, sample_size, avg_engagement, avg_likes, ...}],
//     promos:     [{promo_id,    sample_size, avg_engagement, ...}],
//     totalSamples: number,
//   }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('caption_ab_analysis')
      .select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (!data || data.length === 0) {
      return NextResponse.json({ templates: [], promos: [], totalSamples: 0 });
    }

    // Aggregate per template_id (across all promos)
    const tmpAgg = {};
    const promoAgg = {};
    let totalSamples = 0;

    for (const row of data) {
      const tid = row.template_id;
      const pid = row.promo_id;
      const samples = row.sample_size;

      if (!tmpAgg[tid]) tmpAgg[tid] = { template_id: tid, sample_size: 0, total_score: 0, total_likes: 0, total_comments: 0, total_shares: 0 };
      tmpAgg[tid].sample_size += samples;
      tmpAgg[tid].total_score += row.avg_engagement * samples;
      tmpAgg[tid].total_likes += row.avg_likes * samples;
      tmpAgg[tid].total_comments += row.avg_comments * samples;
      tmpAgg[tid].total_shares += row.avg_shares * samples;

      if (!promoAgg[pid]) promoAgg[pid] = { promo_id: pid, sample_size: 0, total_score: 0 };
      promoAgg[pid].sample_size += samples;
      promoAgg[pid].total_score += row.avg_engagement * samples;

      totalSamples += samples;
    }

    const templates = Object.values(tmpAgg).map(t => ({
      template_id: t.template_id,
      sample_size: t.sample_size,
      avg_engagement: Math.round((t.total_score / t.sample_size) * 100) / 100,
      avg_likes: Math.round((t.total_likes / t.sample_size) * 100) / 100,
      avg_comments: Math.round((t.total_comments / t.sample_size) * 100) / 100,
      avg_shares: Math.round((t.total_shares / t.sample_size) * 100) / 100,
    })).sort((a, b) => b.avg_engagement - a.avg_engagement);

    const promos = Object.values(promoAgg).map(p => ({
      promo_id: p.promo_id,
      sample_size: p.sample_size,
      avg_engagement: Math.round((p.total_score / p.sample_size) * 100) / 100,
    })).sort((a, b) => b.avg_engagement - a.avg_engagement);

    return NextResponse.json({ templates, promos, totalSamples });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
