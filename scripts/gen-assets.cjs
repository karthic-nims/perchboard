/*
 * Generates bundled assets as embedded data URLs so the app needs no binary
 * files checked in:
 *   - src/renderer/src/assets.ts  -> ding sound (WAV data URL)
 *   - src/main/icon.ts            -> tray icon (PNG data URL)
 * Idempotent: safe to re-run (used as a postinstall hook).
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const root = path.resolve(__dirname, '..')

/* ---------- ding.wav: a short two-tone chime with exponential decay ---------- */
function makeDingWavBase64() {
  const sampleRate = 44100
  const duration = 0.55
  const n = Math.floor(sampleRate * duration)
  const data = Buffer.alloc(n * 2) // 16-bit mono
  const tones = [880, 1318.5] // A5 then E6
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    const env = Math.exp(-4.5 * t) // decay envelope
    let s = 0
    for (const f of tones) s += Math.sin(2 * Math.PI * f * t)
    s = (s / tones.length) * env
    const v = Math.max(-1, Math.min(1, s))
    data.writeInt16LE((v * 32767) | 0, i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data]).toString('base64')
}

/* ---------- warn.wav: a soft "heads-up" double pulse, gentler than the ding ---------- */
function makeWarnWavBase64() {
  const sampleRate = 44100
  const duration = 0.75
  const n = Math.floor(sampleRate * duration)
  const data = Buffer.alloc(n * 2) // 16-bit mono
  const freq = 587.33 // D5 — mellow, lower than the end chime
  // two short, soft pulses so it reads as a distinct "about to end" cue
  const pulses = [
    { at: 0.0, len: 0.22 },
    { at: 0.3, len: 0.28 }
  ]
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate
    let s = 0
    for (const p of pulses) {
      const lt = t - p.at
      if (lt < 0 || lt > p.len) continue
      // soft attack + gentle decay envelope for a rounded, non-jarring tone
      const attack = Math.min(1, lt / 0.02)
      const env = attack * Math.exp(-5 * lt)
      s += Math.sin(2 * Math.PI * freq * lt) * env
    }
    const v = Math.max(-1, Math.min(1, s * 0.6)) // quieter than the ding
    data.writeInt16LE((v * 32767) | 0, i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(sampleRate * 2, 28)
  header.writeUInt16LE(2, 32)
  header.writeUInt16LE(16, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data]).toString('base64')
}

/* ---------- icon.png: a simple clock/ring glyph (black + alpha, template-safe) ---------- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}
function makeIconPngBase64() {
  const size = 32
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  const rOuter = 14
  const rInner = 11
  // raw RGBA scanlines with filter byte 0 prefix per row
  const raw = Buffer.alloc(size * (size * 4 + 1))
  let p = 0
  for (let y = 0; y < size; y++) {
    raw[p++] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy)
      let a = 0
      // ring
      if (d <= rOuter && d >= rInner) a = 255
      // clock hands (12 o'clock + 4 o'clock-ish), thin
      const handV = Math.abs(dx) <= 1 && dy <= 0 && dy >= -9
      const handH = Math.abs(dy) <= 1 && dx >= 0 && dx <= 7
      if ((handV || handH) && d <= rInner) a = 255
      // center hub
      if (d <= 2) a = 255
      raw[p++] = 0
      raw[p++] = 0
      raw[p++] = 0
      raw[p++] = a
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  const idat = zlib.deflateSync(raw)
  const png = Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
  return png.toString('base64')
}

const ding = makeDingWavBase64()
const warn = makeWarnWavBase64()
const icon = makeIconPngBase64()

fs.writeFileSync(
  path.join(root, 'src/renderer/src/assets.ts'),
  `// AUTO-GENERATED by scripts/gen-assets.cjs — do not edit.\nexport const dingDataUrl = 'data:audio/wav;base64,${ding}'\nexport const warnDataUrl = 'data:audio/wav;base64,${warn}'\n`
)
fs.writeFileSync(
  path.join(root, 'src/main/icon.ts'),
  `// AUTO-GENERATED by scripts/gen-assets.cjs — do not edit.\nexport const iconDataUrl = 'data:image/png;base64,${icon}'\n`
)
console.log('gen-assets: wrote ding + icon data URLs')
