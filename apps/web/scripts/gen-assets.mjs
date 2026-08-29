// Generates brand raster assets with zero dependencies:
//   public/og.png        — 1200x630 social card (raster PNG, crawlers require it)
//   public/favicon.ico   — multi-size ICO (16/32/48) for Safari/legacy
//   public/apple-touch-icon.png — 180x180 iOS home-screen icon
// Brand: T.cream #FCFBF8 bg, T.ink #0A0A0D wordmark, T.lavenderAA #7A7CFF accent.
// Run: node apps/web/scripts/gen-assets.mjs
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.resolve(__dirname, "..", "public");

// ── tiny PNG encoder (RGBA, no compression tricks — zlib level 9) ──
function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// ── brand palette (mirrors Theme.js) ──
const CREAM = [252, 251, 248];
const INK = [10, 10, 13];
const LAV = [122, 124, 255];
const LAV_LIGHT = [235, 235, 255];

function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }

// Draw helpers operating on a Float coverage buffer
function makeCanvas(w, h, bg) {
  const px = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) { px[i * 3] = bg[0]; px[i * 3 + 1] = bg[1]; px[i * 3 + 2] = bg[2]; }
  return px;
}
function blendRect(px, w, x0, y0, rw, rh, color, alpha = 1) {
  for (let y = Math.max(0, y0); y < Math.min(px.length / 3 / w, y0 + rh); y++)
    for (let x = Math.max(0, x0); x < Math.min(w, x0 + rw); x++) {
      const i = (y * w + x) * 3;
      px[i] = Math.round(px[i] * (1 - alpha) + color[0] * alpha);
      px[i + 1] = Math.round(px[i + 1] * (1 - alpha) + color[1] * alpha);
      px[i + 2] = Math.round(px[i + 2] * (1 - alpha) + color[2] * alpha);
    }
}
function blendRoundRect(px, w, h, x0, y0, rw, rh, r, color, alpha = 1) {
  for (let y = y0; y < y0 + rh; y++)
    for (let x = x0; x < x0 + rw; x++) {
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      // rounded-corner coverage
      let cov = 1;
      const dx = x < x0 + r ? x0 + r - x : x > x0 + rw - r ? x - (x0 + rw - r) : 0;
      const dy = y < y0 + r ? y0 + r - y : y > y0 + rh - r ? y - (y0 + rh - r) : 0;
      if (dx > 0 && dy > 0) {
        const d = Math.hypot(dx, dy);
        cov = Math.max(0, Math.min(1, r - d + 0.5));
      }
      if (cov <= 0) continue;
      const i = (y * w + x) * 3;
      px[i] = Math.round(px[i] * (1 - alpha * cov) + color[0] * alpha * cov);
      px[i + 1] = Math.round(px[i + 1] * (1 - alpha * cov) + color[1] * alpha * cov);
      px[i + 2] = Math.round(px[i + 2] * (1 - alpha * cov) + color[2] * alpha * cov);
    }
}
// 5x7 bitmap font for wordmark + labels (geometric, JetBrains-like feel)
const FONT = {
  A:["01110","10001","10001","11111","10001","10001","10001"],B:["11110","10001","10001","11110","10001","10001","11110"],C:["01110","10001","10000","10000","10000","10001","01110"],D:["11110","10001","10001","10001","10001","10001","11110"],E:["11111","10000","10000","11110","10000","10000","11111"],F:["11111","10000","10000","11110","10000","10000","10000"],G:["01110","10001","10000","10111","10001","10001","01110"],H:["10001","10001","10001","11111","10001","10001","10001"],I:["11111","00100","00100","00100","00100","00100","11111"],J:["00111","00010","00010","00010","00010","10010","01100"],K:["10001","10010","10100","11000","10100","10010","10001"],L:["10000","10000","10000","10000","10000","10000","11111"],M:["10001","11011","10101","10101","10001","10001","10001"],N:["10001","11001","10101","10011","10001","10001","10001"],O:["01110","10001","10001","10001","10001","10001","01110"],P:["11110","10001","10001","11110","10000","10000","10000"],Q:["01110","10001","10001","10001","10101","10011","01111"],R:["11110","10001","10001","11110","10100","10010","10001"],S:["01111","10000","10000","01110","00001","00001","11110"],T:["11111","00100","00100","00100","00100","00100","00100"],U:["10001","10001","10001","10001","10001","10001","01110"],V:["10001","10001","10001","10001","10001","01010","00100"],W:["10001","10001","10001","10101","10101","11011","10001"],X:["10001","01010","00100","00100","00100","01010","10001"],Y:["10001","01010","00100","00100","00100","00100","00100"],Z:["11111","00001","00010","00100","01000","10000","11111"],".":["00000","00000","00000","00000","00000","01100","01100"],",":["00000","00000","00000","00000","01100","00100","01000"],"-":["00000","00000","00000","11111","00000","00000","00000"],"·":["00000","00000","00000","00000","01100","01100","00000"],":":["00000","01100","01100","00000","01100","01100","00000"],"/":["00001","00001","00010","00100","01000","10000","10000"],"£":["01110","10001","10000","11110","10000","10001","01110"],"0":["01110","10001","10011","10101","11001","10001","01110"],"1":["00100","01100","00100","00100","00100","00100","01110"],"2":["01110","10001","00001","00110","01000","10000","11111"],"3":["11110","00001","00001","01110","00001","00001","11110"],"4":["00010","00110","01010","10010","11111","00010","00010"],"5":["11111","10000","11110","00001","00001","10001","01110"],"6":["00110","01000","10000","11110","10001","10001","01110"],"7":["11111","00001","00010","00100","01000","01000","01000"],"8":["01110","10001","10001","01110","10001","10001","01110"],"9":["01110","10001","10001","01111","00001","00010","01100"],"%":["11001","11010","00010","00100","01000","01011","10011"]," ":["00000","00000","00000","00000","00000","00000","00000"],
};
function drawText(px, w, h, text, x, y, scale, color, alpha = 1) {
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch] || FONT[" "];
    for (let gy = 0; gy < 7; gy++)
      for (let gx = 0; gx < 5; gx++)
        if (g[gy][gx] === "1")
          blendRect(px, w, cx + gx * scale, y + gy * scale, scale, scale, color, alpha);
    cx += 6 * scale;
  }
  return cx - x;
}
function textWidth(text, scale) { return text.length * 6 * scale - scale; }

// ── OG card 1200x630 ──
function genOg() {
  const W = 1200, H = 630;
  const px = makeCanvas(W, H, CREAM);
  // lavender glow top-center (radial, soft)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - W / 2, y + 120) / 420;
      if (d < 1) {
        const a = 0.16 * (1 - d) ** 2;
        const i = (y * W + x) * 3;
        px[i] = Math.round(px[i] * (1 - a) + LAV[0] * a);
        px[i + 1] = Math.round(px[i + 1] * (1 - a) + LAV[1] * a);
        px[i + 2] = Math.round(px[i + 2] * (1 - a) + LAV[2] * a);
      }
    }
  // grid pattern 32px, faint ink
  for (let x = 0; x < W; x += 32) blendRect(px, W, x, 0, 1, H, INK, 0.03);
  for (let y = 0; y < H; y += 32) blendRect(px, W, 0, y, W, 1, INK, 0.03);
  // card panel (ink, rounded 24) right side — receipt motif
  blendRoundRect(px, W, H, 700, 90, 420, 450, 24, INK, 1);
  // receipt header dot + label
  blendRect(px, W, 740, 130, 12, 12, hex("#0F6D5A"), 1);
  drawText(px, W, H, "APPLICATION RECEIPT", 764, 128, 2, hex("#8A8885"), 1);
  // receipt rows
  const rows = [["FOUND", "0.3S"], ["MATCH", "92%"], ["PROOF", "A4 PDF"], ["STATUS", "APPLIED"]];
  rows.forEach(([k, v], i) => {
    blendRoundRect(px, W, H, 740, 170 + i * 86, 340, 70, 12, hex("#1A1A1E"), 1);
    drawText(px, W, H, k, 764, 190 + i * 86, 2, hex("#6F6D6A"), 1);
    drawText(px, W, H, v, 764, 206 + i * 86, 3, CREAM, 1);
  });
  // dial — ring approximation: lavender filled circle + inner cream cut + ink core
  const dcx = 1020, dcy = 205, dr = 62;
  for (let y = -dr; y <= dr; y++)
    for (let x = -dr; x <= dr; x++) {
      const d = Math.hypot(x, y);
      if (d <= dr && d >= dr - 10) blendRect(px, W, dcx + x, dcy + y, 1, 1, LAV, 1);
      else if (d < dr - 10) blendRect(px, W, dcx + x, dcy + y, 1, 1, INK, 1);
    }
  // headline (left)
  const S = 9; // big bitmap scale
  let ty = 190;
  ty += drawText(px, W, H, "YOU'VE GOT THE CV.", 80, ty, S, INK, 1) + 18;
  ty += drawText(px, W, H, "WE BUILD THE", 80, ty, S, LAV, 1) + 18;
  drawText(px, W, H, "RECEIPT.", 80, ty, S, INK, 1);
  // sub
  drawText(px, W, H, "£0.10/JOB APPLIED - PAYG CREDITS - NEVER EXPIRE", 80, 480, 3, hex("#6F6D6A"), 1);
  // CTA pill
  blendRoundRect(px, W, H, 80, 520, 380, 64, 32, INK, 1);
  drawText(px, W, H, "START FREE - 5 CREDITS", 120, 542, 3, CREAM, 1);
  // wordmark top-left
  drawText(px, W, H, "JOBCOMPASS", 80, 100, 4, INK, 1);
  blendRect(px, W, 80 + textWidth("JOBCOMPASS", 4) + 16, 100, 8, 28, LAV, 1);
  drawText(px, W, H, "UK", 80 + textWidth("JOBCOMPASS", 4) + 40, 106, 3, hex("#6F6D6A"), 1);
  // footer
  drawText(px, W, H, "JOBCOMPASS.IO - UK - CLOUDFLARE", 80, 596, 2, hex("#8A8885"), 1);

  const rgba = Buffer.alloc(W * H * 4);
  for (let i = 0; i < W * H; i++) { rgba[i * 4] = px[i * 3]; rgba[i * 4 + 1] = px[i * 3 + 1]; rgba[i * 4 + 2] = px[i * 3 + 2]; rgba[i * 4 + 3] = 255; }
  fs.writeFileSync(path.join(PUB, "og.png"), encodePNG(W, H, rgba));
  console.log("og.png", W + "x" + H, fs.statSync(path.join(PUB, "og.png")).size, "bytes");
}

// ── favicon 32x32 (ink rounded square + lavender compass tick) ──
function genFaviconFrame(size) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * 0.24;
  const cx = size / 2, cy = size / 2;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      // rounded square coverage
      const dx = Math.max(r - x, 0, x - (size - 1 - r));
      const dy = Math.max(r - y, 0, y - (size - 1 - r));
      const d = Math.hypot(dx, dy);
      if (d > r) { px[i + 3] = 0; continue; }
      px[i] = INK[0]; px[i + 1] = INK[1]; px[i + 2] = INK[2]; px[i + 3] = 255;
      // needle: lavender diamond from center pointing up-right
      const nx = x - cx, ny = y - cy;
      if (nx >= 0 && ny <= 0 && Math.abs(nx) + Math.abs(ny) <= size * 0.3) { px[i] = LAV[0]; px[i + 1] = LAV[1]; px[i + 2] = LAV[2]; }
      if (nx <= 0 && ny >= 0 && Math.abs(nx) + Math.abs(ny) <= size * 0.3) { px[i] = CREAM[0]; px[i + 1] = CREAM[1]; px[i + 2] = CREAM[2]; }
    }
  return px;
}
function bmpFromRGBA(size, rgba) {
  // 32bpp BMP with BITMAPV4HEADER? Safari/legacy accept 32bpp BITMAPINFOHEADER with alpha ignored.
  // Simplest robust ICO entry: 24bpp BMP bottom-up, no alpha (transparent -> bg ink).
  const rowSize = Math.ceil((size * 24) / 32) * 4;
  const pixSize = rowSize * size;
  const maskSize = Math.ceil(size / 32) * 4 * size;
  const buf = Buffer.alloc(40 + pixSize + maskSize);
  buf.writeUInt32LE(40, 0); // bih size
  buf.writeInt32LE(size, 4); buf.writeInt32LE(size * 2, 8); // height = 2x for XOR+AND
  buf.writeUInt16LE(1, 12); buf.writeUInt16LE(24, 14);
  buf.writeUInt32LE(0, 16); buf.writeUInt32LE(pixSize + maskSize, 20);
  let off = 40;
  for (let y = size - 1; y >= 0; y--)
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4;
      buf[off++] = rgba[s + 2]; buf[off++] = rgba[s + 1]; buf[off++] = rgba[s];
    }
  off = 40 + pixSize;
  for (let y = 0; y < size * maskSize / 4; y++) buf[off++] = 0; // opaque mask (no alpha in 24bpp)
  return buf;
}
function genIco() {
  const sizes = [16, 32, 48];
  const images = sizes.map((s) => ({ s, rgba: genFaviconFrame(s), bmp: null }));
  images.forEach((im) => { im.bmp = bmpFromRGBA(im.s, im.rgba); });
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  const dir = Buffer.alloc(16 * sizes.length);
  let offset = 6 + 16 * sizes.length;
  images.forEach((im, i) => {
    const o = i * 16;
    dir[o] = im.s; dir[o + 1] = im.s; dir[o + 2] = 0; dir[o + 3] = 0;
    dir.writeUInt16LE(1, o + 4); dir.writeUInt16LE(24, o + 6);
    dir.writeUInt32LE(im.bmp.length, o + 8); dir.writeUInt32LE(offset, o + 12);
    offset += im.bmp.length;
  });
  fs.writeFileSync(path.join(PUB, "favicon.ico"), Buffer.concat([header, dir, ...images.map((im) => im.bmp)]));
  console.log("favicon.ico", sizes.join("/"), fs.statSync(path.join(PUB, "favicon.ico")).size, "bytes");
}

// ── apple-touch-icon 180x180 PNG ──
function genApple() {
  const S = 180;
  const rgba = genFaviconFrame(S);
  fs.writeFileSync(path.join(PUB, "apple-touch-icon.png"), encodePNG(S, S, rgba));
  console.log("apple-touch-icon.png", fs.statSync(path.join(PUB, "apple-touch-icon.png")).size, "bytes");
}

fs.mkdirSync(PUB, { recursive: true });
genOg();
genIco();
genApple();
