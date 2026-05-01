// ============================================================
// API: Email Digest Test — Phase 3.3
//
// POST /api/email-digest-test
//   Trigger send email digest sekarang juga (gak nunggu jam 07:00).
//   Useful buat test SMTP setup setelah edit .env.
//
// IMPORTANT: API ini cuma jalan kalau bot worker yang lokal
// (env-nya udah ada SMTP credential). Karena dashboard di Vercel,
// API ini gak akan kerja kecuali env Vercel-nya juga di-set.
//
// Alternative: trigger manual dari PC1 via:
//   node -e "require('./src/services/email-digest').sendDigest().then(r => console.log(r))"
// ============================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Cek env (Vercel-side)
  if (process.env.EMAIL_DIGEST_ENABLED !== 'true') {
    return NextResponse.json({
      ok: false,
      reason: 'disabled',
      hint: 'Set EMAIL_DIGEST_ENABLED=true + SMTP credentials di Vercel env vars (atau jalanin manual dari PC1)'
    }, { status: 400 });
  }
  return NextResponse.json({
    ok: false,
    reason: 'send-via-pc1',
    hint: 'Email digest jalannya dari bot-worker (PC1), bukan dari Vercel. Trigger manual: node -e "require(\'./src/services/email-digest\').sendDigest().then(console.log)"',
  });
}
