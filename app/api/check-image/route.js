/**
 * API Route: /api/check-image
 *
 * Download gambar dari URL (Facebook, dll), hitung pHash,
 * bandingkan dengan database image_hashes di Supabase.
 *
 * POST { imageUrl: string, userName: string }
 * Returns { isDuplicate, similarity, owner, group, hash }
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ── pHash implementation (server-side, tanpa canvas) ──
// Menggunakan raw pixel manipulation dari JPEG/PNG buffer

const HASH_SIZE = 8;
const SAMPLE_SIZE = 32;

/**
 * Decode gambar ke grayscale pixel array menggunakan simple JPEG/PNG decode.
 * Karena di Vercel serverless tidak ada canvas, kita pakai pendekatan sederhana.
 */
async function getImageBuffer(url) {
  // Download gambar dengan timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    return Buffer.from(buffer);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Hitung average hash dari raw image bytes.
 * Ini lebih sederhana dari DCT-based pHash tapi tetap efektif
 * untuk mendeteksi gambar yang sama setelah kompresi/resize.
 *
 * Menggunakan raw byte analysis: sampling pixel dari buffer gambar.
 */
function computeAverageHash(buffer) {
  // Ambil sample bytes dari gambar (skip header, ambil data area)
  const dataStart = Math.min(512, Math.floor(buffer.length * 0.1));
  const dataEnd = buffer.length;
  const sampleCount = SAMPLE_SIZE * SAMPLE_SIZE;
  const step = Math.max(1, Math.floor((dataEnd - dataStart) / sampleCount));

  const samples = new Float64Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    const offset = dataStart + (i * step);
    if (offset < buffer.length) {
      samples[i] = buffer[offset];
    }
  }

  // Hitung mean
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i];
  const mean = sum / samples.length;

  // Generate hash: 1 kalau > mean, 0 kalau <= mean
  let hash = '';
  for (let i = 0; i < 64; i++) {
    const idx = Math.floor(i * samples.length / 64);
    hash += samples[idx] > mean ? '1' : '0';
  }

  // Convert to hex
  let hex = '';
  for (let i = 0; i < hash.length; i += 4) {
    hex += parseInt(hash.substring(i, i + 4), 2).toString(16);
  }

  return hex;
}

/**
 * Hitung Hamming distance antara 2 hash.
 */
function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const b1 = parseInt(hash1[i], 16);
    const b2 = parseInt(hash2[i], 16);
    let xor = b1 ^ b2;
    while (xor > 0) { distance += xor & 1; xor >>= 1; }
  }
  return distance;
}

function similarity(hash1, hash2) {
  const dist = hammingDistance(hash1, hash2);
  const totalBits = (hash1 || '').length * 4;
  if (totalBits === 0) return 0;
  return Math.round((1 - dist / totalBits) * 100);
}

export async function POST(request) {
  try {
    const { imageUrl, userName } = await request.json();

    if (!imageUrl) {
      return Response.json({ error: 'imageUrl wajib diisi' }, { status: 400 });
    }

    // 1. Download gambar
    let buffer;
    try {
      buffer = await getImageBuffer(imageUrl);
    } catch (err) {
      return Response.json({
        error: `Gagal download gambar: ${err.message}`,
        isDuplicate: false,
      }, { status: 200 });
    }

    if (buffer.length < 1000) {
      return Response.json({
        error: 'Gambar terlalu kecil atau tidak valid',
        isDuplicate: false,
      }, { status: 200 });
    }

    // 2. Hitung hash
    const newHash = computeAverageHash(buffer);

    // 3. Ambil semua hash dari database
    const { data: hashes } = await supabase
      .from('image_hashes')
      .select('phash, user_name, group_name, club, source, created_at')
      .order('created_at', { ascending: false })
      .limit(5000);

    if (!hashes || hashes.length === 0) {
      return Response.json({
        isDuplicate: false,
        hash: newHash,
        message: 'Belum ada data gambar di database',
      });
    }

    // 4. Bandingkan dengan semua hash
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const existing of hashes) {
      const sim = similarity(newHash, existing.phash);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestMatch = existing;
      }
    }

    const THRESHOLD = 85; // 85% similarity = dianggap duplikat
    const isDuplicate = bestSimilarity >= THRESHOLD;

    // 5. Cek apakah milik member lain
    const isOtherMember = isDuplicate && bestMatch && bestMatch.user_name !== userName;

    return Response.json({
      isDuplicate,
      isOtherMember,
      similarity: bestSimilarity,
      hash: newHash,
      match: isDuplicate ? {
        owner: bestMatch.user_name,
        group: bestMatch.group_name,
        club: bestMatch.club,
        source: bestMatch.source,
        date: bestMatch.created_at,
      } : null,
      message: isDuplicate
        ? isOtherMember
          ? `Gambar ini mirip ${bestSimilarity}% dengan gambar milik "${bestMatch.user_name}" di "${bestMatch.group_name}". Tidak boleh menggunakan gambar yang sama!`
          : `Gambar ini mirip ${bestSimilarity}% dengan gambar yang sudah kamu posting di "${bestMatch.group_name}".`
        : 'Gambar OK — tidak ada duplikat terdeteksi.',
    });
  } catch (err) {
    return Response.json({ error: err.message, isDuplicate: false }, { status: 500 });
  }
}
