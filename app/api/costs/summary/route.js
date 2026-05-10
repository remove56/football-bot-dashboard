/**
 * GET /api/costs/summary
 *
 * Aggregate api_costs:
 *   - Last 7 days per service: total cost + total chars + success rate
 *   - Last 30 days total
 *   - Projected monthly burn
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function GET() {
  try {
    const now = Date.now();
    const since7d = new Date(now - 7 * 86400000).toISOString();
    const since30d = new Date(now - 30 * 86400000).toISOString();

    // 7d data per service
    const { data: rows7d } = await supabase.from('api_costs')
      .select('service, chars_processed, cost_usd, cost_idr, success')
      .gte('request_at', since7d)
      .limit(10000);

    const byService = {};
    for (const r of rows7d || []) {
      const s = r.service;
      if (!byService[s]) byService[s] = { service: s, total_chars: 0, total_usd: 0, total_idr: 0, calls: 0, success_calls: 0 };
      byService[s].total_chars += r.chars_processed || 0;
      byService[s].total_usd += parseFloat(r.cost_usd || 0);
      byService[s].total_idr += parseFloat(r.cost_idr || 0);
      byService[s].calls++;
      if (r.success) byService[s].success_calls++;
    }
    const services = Object.values(byService).map(s => ({
      ...s,
      total_usd: parseFloat(s.total_usd.toFixed(4)),
      total_idr: parseFloat(s.total_idr.toFixed(2)),
      success_rate: s.calls > 0 ? (s.success_calls / s.calls) : 0,
    })).sort((a, b) => b.total_usd - a.total_usd);

    const total7dUsd = services.reduce((sum, s) => sum + s.total_usd, 0);
    const total7dIdr = services.reduce((sum, s) => sum + s.total_idr, 0);

    // 30d total (cuma sum aggregate, gak per-service)
    const { count: total30dCalls } = await supabase.from('api_costs')
      .select('id', { count: 'exact', head: true })
      .gte('request_at', since30d);

    return Response.json({
      services_7d: services,
      summary_7d: {
        total_calls: services.reduce((s, x) => s + x.calls, 0),
        total_usd: parseFloat(total7dUsd.toFixed(4)),
        total_idr: parseFloat(total7dIdr.toFixed(2)),
      },
      projection_monthly: {
        total_usd: parseFloat((total7dUsd * (30/7)).toFixed(2)),
        total_idr: parseFloat((total7dIdr * (30/7)).toFixed(0)),
      },
      total_calls_30d: total30dCalls || 0,
      generated_at: new Date().toISOString(),
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
