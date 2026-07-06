/*
 * Generates the Perchboard app icon at resources/icon.png (1024x1024 RGBA).
 * electron-builder derives the macOS .icns and Windows .ico from this file.
 *
 * Pure Node (no image libs): a dark rounded-square with a glowing teal
 * "focus ring" clock, drawn with analytic anti-aliasing via signed-distance
 * fields. Re-run with `npm run gen-icon` after tweaking.
 */
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

const SIZE = 1024

// ---- tiny PNG encoder (RGBA, 8-bit) ----
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

// ---- signed-distance helpers ----
function sdRoundRect(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r)
  const qy = Math.abs(py - cy) - (halfH - r)
  const ax = Math.max(qx, 0)
  const ay = Math.max(qy, 0)
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r
}
function sdSegment(px, py, ax, ay, bx, by, thick) {
  const pax = px - ax
  const pay = py - ay
  const bax = bx - ax
  const bay = by - ay
  const h = Math.max(0, Math.min(1, (pax * bax + pay * bay) / (bax * bax + bay * bay)))
  return Math.hypot(pax - bax * h, pay - bay * h) - thick
}
// coverage 0..1 from a signed distance (negative = inside), ~1.4px soft edge
function cov(d) {
  return Math.max(0, Math.min(1, 0.5 - d / 1.4))
}
function mix(a, b, t) {
  return a + (b - a) * t
}

function makeIconPngBase64() {
  const C = SIZE / 2
  const raw = Buffer.alloc(SIZE * (SIZE * 4 + 1))

  // palette
  const bgTop = [34, 49, 78] // slate blue
  const bgBot = [12, 20, 37] // near-black
  const ringCol = [45, 212, 191] // teal-400
  const handCol = [94, 234, 212] // teal-300
  const dotCol = [153, 246, 228] // teal-200

  // clock geometry
  const ringMid = 266
  const ringHalf = 34
  // hand points up-right (~1 o'clock); screen y is down
  const ang = -Math.PI / 3
  const handEndX = C + Math.cos(ang) * 190
  const handEndY = C + Math.sin(ang) * 190

  let p = 0
  for (let y = 0; y < SIZE; y++) {
    raw[p++] = 0 // filter: none
    const g = y / (SIZE - 1)
    for (let x = 0; x < SIZE; x++) {
      // base gradient
      let r = mix(bgTop[0], bgBot[0], g)
      let gr = mix(bgTop[1], bgBot[1], g)
      let b = mix(bgTop[2], bgBot[2], g)

      // clock ring (annulus)
      const ringD = Math.abs(Math.hypot(x - C, y - C) - ringMid) - ringHalf
      const rc = cov(ringD)
      r = mix(r, ringCol[0], rc)
      gr = mix(gr, ringCol[1], rc)
      b = mix(b, ringCol[2], rc)

      // hand
      const hc = cov(sdSegment(x, y, C, C, handEndX, handEndY, 26))
      r = mix(r, handCol[0], hc)
      gr = mix(gr, handCol[1], hc)
      b = mix(b, handCol[2], hc)

      // center hub
      const dc = cov(Math.hypot(x - C, y - C) - 34)
      r = mix(r, dotCol[0], dc)
      gr = mix(gr, dotCol[1], dc)
      b = mix(b, dotCol[2], dc)

      // rounded-square mask (full-bleed, macOS-ish corner radius)
      const a = cov(sdRoundRect(x, y, C, C, C, C, 224)) * 255

      raw[p++] = Math.round(r)
      raw[p++] = Math.round(gr)
      raw[p++] = Math.round(b)
      raw[p++] = Math.round(a)
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(SIZE, 0)
  ihdr.writeUInt32BE(SIZE, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0))
  ])
}

const out = path.resolve(__dirname, '..', 'resources', 'icon.png')
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, makeIconPngBase64())
console.log('gen-icon: wrote', out)
