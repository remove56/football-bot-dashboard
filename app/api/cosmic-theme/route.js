// ============================================================
// API: Cosmic Theme — global theme controlled by admin
//
// GET  /api/cosmic-theme
//   Public — return current global theme (semua user fetch ini saat load)
//
// POST /api/cosmic-theme  body: { theme: 'cosmic-warp' | 'cosmic-circuit' | 'cosmic-3', userId, role }
//   Admin only — save theme baru ke app_config table.
//   Validation lewat user role di body (frontend kasih).
//
// Storage: app_config table (key='cosmic_theme', value=jsonb string).
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const VALID_THEMES = ['cosmic-warp', 'cosmic-circuit', 'cosmic-3'];

export async function GET() {
  try {
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'cosmic_theme')
      .single();
    let theme = 'cosmic-warp';
    if (data?.value) {
      const v = typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
      const stripped = v.replace(/^"|"$/g, '');
      if (VALID_THEMES.includes(stripped)) theme = stripped;
    }
    return NextResponse.json({ theme });
  } catch (e) {
    return NextResponse.json({ theme: 'cosmic-warp' });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { theme, role } = body;

    // Admin only
    if (role !== 'admin') {
      return NextResponse.json({ error: 'admin only' }, { status: 403 });
    }
    if (!VALID_THEMES.includes(theme)) {
      return NextResponse.json({ error: 'invalid theme' }, { status: 400 });
    }

    const { error } = await supabase.from('app_config').upsert(
      { key: 'cosmic_theme', value: JSON.stringify(theme) },
      { onConflict: 'key' }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, theme });
  } catch (e) {
    return NextResponse.json({ error: e.message?.substring(0, 200) }, { status: 500 });
  }
}
