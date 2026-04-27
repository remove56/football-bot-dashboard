// ============================================================
// API: Cron Backup — dipanggil otomatis oleh Vercel Cron tiap hari 02:00 WIB.
//
// Proses:
//   1. Verifikasi request dari Vercel Cron (header x-vercel-cron atau CRON_SECRET)
//   2. Dump semua tabel penting ke JSON
//   3. Simpan snapshot ke tabel backups_log
//   4. Jalankan cleanup_old_backups() — sisain 30 backup terbaru
//
// Tabel yang di-backup (prioritas tinggi):
//   users, groups, bot_accounts, posting_tracker, task_queue, reels_tasks,
//   content_registry, image_hashes, link_submissions, weekly_stats, target_notes
//
// Tidak di-backup (biar hemat space):
//   activity_log (terlalu besar, bisa regenerate dari post actual)
//   image_hashes content (hanya ambil hash, bukan full data)
//
// Trigger manual: POST ke endpoint ini dengan header Authorization: Bearer ADMIN_SECRET
// Trigger auto: Vercel Cron (GET request dengan x-vercel-cron header)
// ============================================================

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Tabel yang di-backup. Prioritas: data yang susah regenerate kalau hilang.
const BACKUP_TABLES = [
  'users',
  'groups',
  'bot_accounts',
  'posting_tracker',
  'task_queue',
  'reels_tasks',
  'content_registry',
  'link_submissions',
  'weekly_stats',
  'target_notes',
];

// activity_log di-skip karena volume besar dan bisa regenerate
// image_hashes di-backup terpisah (cuma ambil phash + source, nggak ambil binary)
const LIGHT_BACKUP_TABLES = [
  { name: 'image_hashes', columns: 'phash, source_url, user_name, group_id, content_type, source, created_at' },
];

async function verifyRequest(req) {
  // 1. Vercel Cron otomatis tambah header x-vercel-cron
  const isVercelCron = req.headers.get('x-vercel-cron') === '1';
  if (isVercelCron) return { ok: true, via: 'vercel-cron' };

  // 2. Manual trigger dengan CRON_SECRET env var
  const authHeader = req.headers.get('authorization');
  const expected = process.env.CRON_SECRET;
  if (expected && authHeader === `Bearer ${expected}`) {
    return { ok: true, via: 'manual-secret' };
  }

  return { ok: false };
}

async function dumpTable(tableName, columns = '*') {
  const allRows = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Dump ${tableName}: ${error.message}`);
    if (!data || data.length === 0) break;
    allRows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return allRows;
}

// ============================================================
// CLEANUP — hapus data lama biar DB tetep lean (free tier Supabase)
// Dipanggil setiap habis backup sukses (1 cron = backup + cleanup).
//
// Retention policy:
//   image_hashes        > 30 hari → DELETE (deduplication ngecek tetep work, hash baru terus dibikin)
//   activity_log        > 60 hari → DELETE (volume besar, regenerable dari posting_tracker)
//   task_queue (done)   > 14 hari → DELETE (history operasional, gak perlu lama)
//   task_queue (failed) > 14 hari → DELETE
// ============================================================
async function runCleanup() {
  const startTime = Date.now();
  const results = {};

  const cleanupTargets = [
    { table: 'image_hashes', daysAgo: 30, column: 'created_at' },
    { table: 'activity_log', daysAgo: 60, column: 'created_at' },
    { table: 'task_queue', daysAgo: 14, column: 'created_at', statusIn: ['done', 'failed'] },
  ];

  for (const t of cleanupTargets) {
    try {
      const cutoff = new Date(Date.now() - t.daysAgo * 86400000).toISOString();
      let query = supabase.from(t.table).delete().lt(t.column, cutoff);
      if (t.statusIn) query = query.in('status', t.statusIn);
      const { data, error } = await query.select('id'); // returning deleted rows
      if (error) {
        results[t.table] = { error: error.message };
      } else {
        results[t.table] = { deleted: (data || []).length, retention_days: t.daysAgo };
      }
    } catch (e) {
      results[t.table] = { error: e.message?.substring(0, 200) || 'unknown' };
    }
  }

  return {
    duration_ms: Date.now() - startTime,
    results,
    total_deleted: Object.values(results).reduce((sum, r) => sum + (r.deleted || 0), 0),
  };
}

async function runBackup(triggerType) {
  const startTime = Date.now();
  const tables = {};
  const rowCounts = {};
  let errors = [];

  for (const name of BACKUP_TABLES) {
    try {
      const rows = await dumpTable(name);
      tables[name] = rows;
      rowCounts[name] = rows.length;
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
      tables[name] = [];
      rowCounts[name] = 0;
    }
  }

  for (const t of LIGHT_BACKUP_TABLES) {
    try {
      const rows = await dumpTable(t.name, t.columns);
      tables[t.name] = rows;
      rowCounts[t.name] = rows.length;
    } catch (e) {
      errors.push(`${t.name}: ${e.message}`);
      tables[t.name] = [];
      rowCounts[t.name] = 0;
    }
  }

  const sizeBytes = JSON.stringify(tables).length;

  // Insert backup ke backups_log
  const { error: insertError } = await supabase
    .from('backups_log')
    .insert({
      trigger_type: triggerType,
      row_counts: rowCounts,
      tables,
      size_bytes: sizeBytes,
      error: errors.length > 0 ? errors.join('; ').substring(0, 500) : null,
    });

  if (insertError) {
    return {
      success: false,
      error: `Insert backup failed: ${insertError.message}`,
      errors,
    };
  }

  // Cleanup backup lama — sisain 30 terbaru
  const { data: cleanupData } = await supabase.rpc('cleanup_old_backups');

  return {
    success: true,
    duration_ms: Date.now() - startTime,
    row_counts: rowCounts,
    size_bytes: sizeBytes,
    total_rows: Object.values(rowCounts).reduce((a, b) => a + b, 0),
    errors: errors.length > 0 ? errors : undefined,
    cleanup_deleted: cleanupData || 0,
  };
}

export async function GET(req) {
  const auth = await verifyRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runBackup(auth.via === 'manual-secret' ? 'manual' : 'auto');

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  // Setelah backup sukses, jalankan cleanup data lama (1 cron = backup + cleanup)
  // Kalau cleanup gagal, gak ngerusak backup — cuma kasih warning di response
  let cleanup = null;
  try {
    cleanup = await runCleanup();
  } catch (e) {
    cleanup = { error: e.message?.substring(0, 200) || 'cleanup crashed' };
  }

  return NextResponse.json({ ...result, cleanup });
}

// POST = manual trigger dengan Bearer token (dipakai tombol "Backup Sekarang" di dashboard)
export async function POST(req) {
  return GET(req);
}
