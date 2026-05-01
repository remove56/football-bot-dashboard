// ============================================================
// API: Group Health — Phase 4.1
//
// GET /api/group-health
//   Return semua grup dengan health_score + breakdown, sorted ascending
//   (yang at-risk di atas).
//
// Output:
//   {
//     groups: [
//       { id, name, club, health_score, health_breakdown, health_last_check,
//         category: 'healthy'|'warning'|'at-risk' }
//     ]
//   }
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function categorize(score) {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'warning';
  return 'at-risk';
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('id, name, club, health_score, health_breakdown, health_last_check')
      .order('health_score', { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const groups = (data || []).map(g => ({
      ...g,
      category: categorize(g.health_score ?? 100),
    }));

    return NextResponse.json({ groups });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
