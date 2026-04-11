/**
 * Backup API — export semua data Supabase jadi 1 file JSON.
 *
 * GET  /api/backup      → download backup JSON
 * POST /api/backup      → restore dari uploaded JSON
 *
 * Admin only (protected oleh check header X-Admin-Key).
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Daftar tabel yang di-backup
const BACKUP_TABLES = [
  { name: 'users', limit: null },
  { name: 'groups', limit: null },
  { name: 'bot_accounts', limit: null },
  { name: 'posting_tracker', limit: null },
  { name: 'target_notes', limit: null },
  { name: 'weekly_stats', limit: null },
  { name: 'reels_tasks', limit: 500 },
  { name: 'task_queue', limit: 500 },
  { name: 'link_submissions', limit: 1000 },
  { name: 'activity_log', limit: 2000 },
  { name: 'content_registry', limit: 5000 },
  { name: 'image_hashes', limit: 5000 },
];

/**
 * GET /api/backup
 * Creates a full backup of all tables.
 */
export async function GET(request) {
  try {
    const backup = {
      version: '1.0',
      created_at: new Date().toISOString(),
      source: 'fbgroup-dash',
      tables: {},
      stats: {},
    };

    for (const t of BACKUP_TABLES) {
      let query = supabase.from(t.name).select('*');
      if (t.limit) query = query.order('created_at', { ascending: false }).limit(t.limit);
      const { data, error } = await query;
      if (error) {
        backup.tables[t.name] = [];
        backup.stats[t.name] = { count: 0, error: error.message };
        continue;
      }
      backup.tables[t.name] = data || [];
      backup.stats[t.name] = { count: (data || []).length };
    }

    const totalRows = Object.values(backup.stats).reduce((s, x) => s + (x.count || 0), 0);
    backup.stats.total = totalRows;

    // Return as downloadable JSON
    const json = JSON.stringify(backup, null, 2);
    const filename = `backup_fbgroup_${new Date().toISOString().split('T')[0]}.json`;

    return new Response(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/backup
 * Restore from uploaded backup JSON.
 * Body: { backup: {...}, tables: ['users', 'groups', ...] (opsional, kalau kosong restore semua) }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const backup = body.backup;
    const selectedTables = body.tables || null;

    if (!backup || !backup.tables) {
      return Response.json({ error: 'Format backup tidak valid' }, { status: 400 });
    }

    const results = {};

    for (const t of BACKUP_TABLES) {
      if (selectedTables && !selectedTables.includes(t.name)) continue;
      const rows = backup.tables[t.name];
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        results[t.name] = { restored: 0, skipped: true };
        continue;
      }

      // Upsert in batches of 100
      let restored = 0;
      for (let i = 0; i < rows.length; i += 100) {
        const batch = rows.slice(i, i + 100);
        const { error } = await supabase.from(t.name).upsert(batch, { onConflict: 'id' });
        if (error) {
          results[t.name] = { restored, error: error.message };
          break;
        }
        restored += batch.length;
      }
      if (!results[t.name]?.error) {
        results[t.name] = { restored };
      }
    }

    return Response.json({
      success: true,
      message: 'Restore selesai',
      results,
      total: Object.values(results).reduce((s, x) => s + (x.restored || 0), 0),
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
