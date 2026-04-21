// ============================================================
// API: IG Settings — GET all / POST update
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET() {
  try {
    const { data, error } = await supabase.from('ig_settings').select('*');
    if (error) throw error;
    const settings = {};
    for (const row of data || []) settings[row.key] = row.value;
    return NextResponse.json({ settings });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // body = { auto_chain_enabled: 'true', delay_account_1_minutes: '60', ... }
    const rows = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from('ig_settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
