/**
 * GET /api/issues/top
 *
 * Return top failure_patterns sorted by occurrence_count + severity.
 * Cuma yg status='open' (belum di-resolve).
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);

    const { data } = await supabase.from('failure_patterns')
      .select('error_signature, raw_message_sample, severity, status, occurrence_count, first_seen, last_seen, affected_accounts, affected_groups, fix_commit_sha')
      .eq('status', 'open')
      .order('last_seen', { ascending: false })
      .limit(100);

    // Sort di JS karena composite (severity asc + occurrence desc)
    const sorted = (data || []).sort((a, b) => {
      const sevDiff = (SEVERITY_ORDER[a.severity] ?? 4) - (SEVERITY_ORDER[b.severity] ?? 4);
      if (sevDiff !== 0) return sevDiff;
      return (b.occurrence_count || 0) - (a.occurrence_count || 0);
    }).slice(0, limit);

    return Response.json({ issues: sorted, generated_at: new Date().toISOString() });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
