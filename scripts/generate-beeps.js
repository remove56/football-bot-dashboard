// Script generate file WAV beep kecil untuk notifikasi.
// Jalankan sekali: node scripts/generate-beeps.js
// Output ke public/sounds/{chat-beep,notif-beep}.wav

const fs = require('fs');
const path = require('path');

const sampleRate = 44100;

// Generate WAV header (PCM 16-bit mono)
function wavHeader(numSamples) {
  const dataSize = numSamples * 2;
  const buf = Buffer.alloc(44);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);       // fmt chunk size
  buf.writeUInt16LE(1, 20);        // PCM
  buf.writeUInt16LE(1, 22);        // mono
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buf.writeUInt16LE(2, 32);        // block align
  buf.writeUInt16LE(16, 34);       // bits per sample
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  return buf;
}

// Generate tone — sine wave dengan fade in/out biar smooth
function generateTone(freq, durationMs, amplitude = 0.3) {
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const samples = Buffer.alloc(numSamples * 2);
  const fadeLen = Math.min(500, Math.floor(numSamples * 0.1));

  for (let i = 0; i < numSamples; i++) {
    let env = 1;
    if (i < fadeLen) env = i / fadeLen;
    else if (i > numSamples - fadeLen) env = (numSamples - i) / fadeLen;

    const val = Math.sin(2 * Math.PI * freq * i / sampleRate) * amplitude * env;
    const pcm = Math.round(val * 32767);
    samples.writeInt16LE(pcm, i * 2);
  }
  return samples;
}

// Concat beberapa tone dengan silence gap
function concatTones(tones, gapMs = 50) {
  const gapSamples = Math.floor(sampleRate * gapMs / 1000);
  const gap = Buffer.alloc(gapSamples * 2);
  const parts = [];
  for (let i = 0; i < tones.length; i++) {
    parts.push(tones[i]);
    if (i < tones.length - 1) parts.push(gap);
  }
  return Buffer.concat(parts);
}

function buildWav(tones, gapMs) {
  const data = concatTones(tones, gapMs);
  const numSamples = data.length / 2;
  const header = wavHeader(numSamples);
  return Buffer.concat([header, data]);
}

// === Chat beep: 2 tone naik (600Hz → 800Hz, cepat) ===
const chatBeep = buildWav([
  generateTone(600, 100),
  generateTone(800, 100),
], 60);

// === Notif beep: 2 tone turun (880Hz → 660Hz, sedikit lebih panjang) ===
const notifBeep = buildWav([
  generateTone(880, 150),
  generateTone(660, 150),
], 80);

const outDir = path.join(__dirname, '..', 'public', 'sounds');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'chat-beep.wav'), chatBeep);
fs.writeFileSync(path.join(outDir, 'notif-beep.wav'), notifBeep);

console.log('✅ Generated:');
console.log('  public/sounds/chat-beep.wav  (' + chatBeep.length + ' bytes)');
console.log('  public/sounds/notif-beep.wav (' + notifBeep.length + ' bytes)');
