// The Passport Page of a Country That Isn't There
// make.fun bounty: the-passport-page-of-a-countr-2-20261121-0318
//
// A program that draws, pixel by pixel, the open passport spread of the
// Republic of Thalvaris — a fog-bound tidal archipelago that does not exist —
// belonging to Mara Ingrid Ellingsen, a fog-ferry keeper from Havstrand.
// Node 22, standard library only (zlib for PNG). No network. Deterministic:
// every run writes byte-identical /output/entry.png.
//
// The document is built to read as a working document, not a poster:
//  - data page: portrait, bilingual labels, issue/expiry, MRZ with real
//    ICAO 9303 check digits;
//  - visa page: entry/departure stamps from three invented neighbours, every
//    date after the passport's issue date (02 JUN 2023), telling one travel
//    history;
//  - one telling piece of paperwork: the causeway may be crossed at low
//    water only, with the tide table for the day of the last stamp.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 720;

// ---------------------------------------------------------------- palette
const PAPER: RGB = [246, 239, 221];
const PAPER_DARK: RGB = [233, 224, 198];
const INK: RGB = [32, 32, 34];
const NAVY: RGB = [27, 47, 94];
const NAVY_SOFT: RGB = [58, 78, 128];
const BORDO: RGB = [122, 31, 43];
const GOLD: RGB = [146, 116, 58];
const GREY: RGB = [96, 96, 96];
const STAMP_BLUE: RGB = [38, 68, 138];
const STAMP_GREEN: RGB = [28, 104, 66];
const STAMP_RED: RGB = [148, 42, 38];
const SKIN: RGB = [224, 184, 148];
const SKIN_SH: RGB = [198, 152, 116];
const HAIR: RGB = [58, 38, 26];
const COAT: RGB = [38, 56, 92];
const SCARF: RGB = [150, 44, 44];
const MIST: RGB = [188, 202, 214];

type RGB = [number, number, number];

// ---------------------------------------------------------------- canvas
const px = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0];
  px[i * 3 + 1] = PAPER[1];
  px[i * 3 + 2] = PAPER[2];
}

function setPixel(x: number, y: number, c: RGB): void {
  const xi = Math.round(x);
  const yi = Math.round(y);
  if (xi < 0 || yi < 0 || xi >= W || yi >= H) return;
  const o = (yi * W + xi) * 3;
  px[o] = c[0];
  px[o + 1] = c[1];
  px[o + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let j = Math.max(0, Math.floor(y)); j < Math.min(H, Math.ceil(y + h)); j++) {
    for (let i = Math.max(0, Math.floor(x)); i < Math.min(W, Math.ceil(x + w)); i++) {
      setPixel(i, j, c);
    }
  }
}

function hline(x0: number, x1: number, y: number, c: RGB, t = 1): void {
  fillRect(Math.min(x0, x1), y, Math.abs(x1 - x0), t, c);
}

function vline(x: number, y0: number, y1: number, c: RGB, t = 1): void {
  fillRect(x, Math.min(y0, y1), t, Math.abs(y1 - y0), c);
}

function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const n = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let s = 0; s <= n; s++) {
    const x = x0 + (dx * s) / n;
    const y = y0 + (dy * s) / n;
    for (let a = 0; a < t; a++) for (let b = 0; b < t; b++) setPixel(x + a, y + b, c);
  }
}

function circle(cx: number, cy: number, r: number, c: RGB, t = 1): void {
  for (let a = 0; a < 360; a += 1) {
    const rad = (a * Math.PI) / 180;
    for (let k = 0; k < t; k++) {
      setPixel(cx + Math.cos(rad) * (r + k), cy + Math.sin(rad) * (r + k), c);
    }
  }
}

function filledCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = -r; y <= r; y++) {
    const half = Math.floor(Math.sqrt(r * r - y * y));
    for (let x = -half; x <= half; x++) setPixel(cx + x, cy + y, c);
  }
}

function ellipse(cx: number, cy: number, rx: number, ry: number, c: RGB): void {
  for (let y = -ry; y <= ry; y++) {
    const half = Math.floor((rx * Math.sqrt(Math.max(0, ry * ry - y * y))) / ry);
    for (let x = -half; x <= half; x++) setPixel(cx + x, cy + y, c);
  }
}

// ---------------------------------------------------------------- 5x7 font
// Each glyph: 7 rows of 5 cells. Uppercase set is drawn for letters; lowercase
// maps to the same glyphs (passports print in capitals anyway).
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "<": ["00010", "00100", "01000", "10000", "01000", "00100", "00010"],
  ">": ["01000", "00100", "00010", "00001", "00010", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "*": ["00000", "10101", "01110", "10101", "00000", "00000", "00000"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
};

function drawGlyph(x: number, y: number, ch: string, s: number, c: RGB, deg = 0): void {
  const g = FONT[ch.toUpperCase()] ?? FONT["?"];
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if (g[r][col] !== "1") continue;
      for (let dy = 0; dy < s; dy++) {
        for (let dx = 0; dx < s; dx++) {
          const px0 = col * s + dx;
          const py0 = r * s + dy;
          const rx = px0 * cos - py0 * sin;
          const ry = px0 * sin + py0 * cos;
          setPixel(x + rx, y + ry, c);
        }
      }
    }
  }
}

/** Draw text left-aligned at (x,y). scale s: glyph cell = s px. Returns width. */
function text(x: number, y: number, str: string, s: number, c: RGB, deg = 0, track = 1): number {
  const rad = (deg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  let cx = x;
  let cy = y;
  for (const ch of str) {
    drawGlyph(cx, cy, ch, s, c, deg);
    const adv = (6 * s + track) * 1;
    cx += adv * cos;
    cy += adv * sin;
  }
  return str.length * (6 * s + track);
}

function textWidth(str: string, s: number, track = 1): number {
  return str.length * (6 * s + track) - track;
}

function textCentered(x: number, y: number, str: string, s: number, c: RGB, deg = 0): void {
  text(x - textWidth(str, s) / 2, y, str, s, c, deg);
}

// ---------------------------------------------------------------- PNG output
const CRC_TABLE: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, "ascii"), data])), 8 + data.length);
  return out;
}

function writePNG(path: string): void {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

// ---------------------------------------------------------------- MRZ (ICAO 9303)
// Check digit: values A=10..Z=35, '<'=0, digits as-is, weights 7,3,1 repeating.
function mrzValue(ch: string): number {
  if (ch >= "0" && ch <= "9") return ch.charCodeAt(0) - 48;
  if (ch >= "A" && ch <= "Z") return ch.charCodeAt(0) - 55;
  return 0;
}
function mrzCheck(s: string): string {
  const w = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += mrzValue(s[i]) * w[i % 3];
  return String(sum % 10);
}
function mrzPad(s: string, n: number): string {
  return (s + "<".repeat(n)).slice(0, n);
}

// Holder: ELLINGSEN, MARA INGRID — born 14 MAR 1988, passport TH 482 917,
// issued 02 JUN 2023 in Havstrand, expires 02 JUN 2033.
const DOC_NO = "TH482917";
const DOC_NO_CD = mrzCheck(DOC_NO);
const DOB = "880314"; // 14 MAR 1988
const EXP = "330602"; // 02 JUN 2033
const MRZ1 = mrzPad("P<THVELLINGSEN<<MARA<INGRID", 44);
const MRZ2_BASE =
  mrzPad(DOC_NO, 9) + DOC_NO_CD + "THV" + DOB + mrzCheck(DOB) + "F" + EXP + mrzCheck(EXP) +
  mrzPad("", 14);
const PERS_CD = mrzCheck(mrzPad("", 14)); // personal-number check digit (all '<' -> 0)
const MRZ2 = MRZ2_BASE + PERS_CD + mrzCheck(MRZ2_BASE + PERS_CD); // + composite check digit

// ---------------------------------------------------------------- portrait
// A fog-ferry keeper: navy cap, dark hair, grey-blue coat, red scarf, mist.
function drawPortrait(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, MIST);
  // mist bands
  for (let i = 0; i < 5; i++) {
    fillRect(x, y + 18 + i * 34, w, 5, [206, 216, 224]);
  }
  // distant ferry silhouette in the fog
  fillRect(x + 14, y + h - 58, 74, 10, [120, 134, 148]);
  fillRect(x + 30, y + h - 78, 6, 22, [120, 134, 148]);
  fillRect(x + 58, y + h - 74, 5, 18, [120, 134, 148]);
  // shoulders / coat (kept inside the photo frame)
  ellipse(x + w / 2, y + 118, 66, 30, COAT);
  fillRect(x + 8, y + 118, w - 16, h - 118, COAT);
  // coat collar
  line(x + w / 2 - 34, y + h - 62, x + w / 2, y + h - 30, [22, 34, 60], 3);
  line(x + w / 2 + 34, y + h - 62, x + w / 2, y + h - 30, [22, 34, 60], 3);
  // red scarf
  fillRect(x + w / 2 - 30, y + h - 74, 60, 16, SCARF);
  // neck
  fillRect(x + w / 2 - 11, y + 96, 22, 26, SKIN_SH);
  // head
  ellipse(x + w / 2, y + 66, 30, 38, SKIN);
  // hair: dark, parted, framing the face
  ellipse(x + w / 2, y + 42, 31, 24, HAIR);
  fillRect(x + w / 2 - 31, y + 34, 12, 44, HAIR);
  fillRect(x + w / 2 + 19, y + 34, 12, 44, HAIR);
  // keeper's cap
  fillRect(x + w / 2 - 32, y + 22, 64, 12, NAVY);
  fillRect(x + w / 2 - 36, y + 32, 72, 5, NAVY);
  filledCircle(x + w / 2, y + 28, 4, GOLD);
  // eyes, brows, nose, mouth
  fillRect(x + w / 2 - 16, y + 58, 8, 3, INK);
  fillRect(x + w / 2 + 8, y + 58, 8, 3, INK);
  fillRect(x + w / 2 - 17, y + 51, 10, 2, HAIR);
  fillRect(x + w / 2 + 7, y + 51, 10, 2, HAIR);
  line(x + w / 2, y + 60, x + w / 2 - 2, y + 74, SKIN_SH, 2);
  fillRect(x + w / 2 - 8, y + 84, 16, 3, [168, 92, 84]);
  // photo frame + corner marks
  for (let i = 0; i < 3; i++) {
    // thin frame
    hline(x, x + w, y + i, NAVY);
    hline(x, x + w, y + h - 1 - i, NAVY);
    vline(x + i, y, y + h, NAVY);
    vline(x + w - 1 - i, y, y + h, NAVY);
  }
}

// ---------------------------------------------------------------- stamps
function stampRound(cx: number, cy: number, r: number, deg: number, c: RGB, lines: string[]): void {
  circle(cx, cy, r, c, 3);
  circle(cx, cy, r - 7, c, 2);
  let yy = cy - (lines.length * 11) / 2;
  for (const ln of lines) {
    textCentered(cx, yy, ln, 1, c, deg);
    yy += 12;
  }
  // two small stars flanking the centre block
  text(cx - r + 10, cy - 4, "*", 1, c, deg);
  text(cx + r - 16, cy - 4, "*", 1, c, deg);
}

function stampRect(x: number, y: number, w: number, h: number, deg: number, c: RGB, lines: string[]): void {
  // draw a rotated rectangle by rotating its four corners around its centre
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rad = (deg * Math.PI) / 180;
  const rot = (px0: number, py0: number): [number, number] => {
    const dx = px0 - cx;
    const dy = py0 - cy;
    return [cx + dx * Math.cos(rad) - dy * Math.sin(rad), cy + dx * Math.sin(rad) + dy * Math.cos(rad)];
  };
  const corners: [number, number][] = [rot(x, y), rot(x + w, y), rot(x + w, y + h), rot(x, y + h)];
  for (let i = 0; i < 4; i++) {
    const [ax, ay] = corners[i];
    const [bx, by] = corners[(i + 1) % 4];
    line(ax, ay, bx, by, c, 2);
  }
  let yy = y + 12;
  for (const ln of lines) {
    textCentered(cx, yy, ln, 1, c, deg);
    yy += 12;
  }
}

// ---------------------------------------------------------------- page furniture
function emblem(cx: number, cy: number, r: number): void {
  // Thalvaris arms: a lighthouse over three waves inside a ring.
  circle(cx, cy, r, NAVY, 3);
  circle(cx, cy, r - 5, GOLD, 1);
  // lighthouse
  fillRect(cx - 4, cy - r + 12, 8, r - 6, NAVY);
  line(cx - 8, cy - r + 12, cx + 8, cy - r + 12, NAVY, 2);
  filledCircle(cx, cy - r + 8, 4, GOLD);
  line(cx - 14, cy - r + 8, cx - 26, cy - r + 2, GOLD, 2);
  line(cx + 14, cy - r + 8, cx + 26, cy - r + 2, GOLD, 2);
  // waves
  for (let i = 0; i < 3; i++) {
    const wy = cy + 4 + i * 7;
    line(cx - r + 10, wy, cx - 6, wy - 4, NAVY_SOFT, 2);
    line(cx - 6, wy - 4, cx + 6, wy + 2, NAVY_SOFT, 2);
    line(cx + 6, wy + 2, cx + r - 10, wy - 2, NAVY_SOFT, 2);
  }
}

function field(x: number, y: number, label: string, value: string, vs = 2, w = 300): void {
  text(x, y, label, 1, GREY);
  text(x, y + 11, value, vs, INK);
  hline(x, x + w, y + 11 + vs * 7 + 5, [190, 182, 160]);
}

function fieldNoRule(x: number, y: number, label: string, value: string, vs = 2): void {
  text(x, y, label, 1, GREY);
  text(x, y + 11, value, vs, INK);
}

// ---------------------------------------------------------------- build the spread
function build(): void {
  // faint guilloche: diagonal hairlines across the whole spread
  for (let d = -H; d < W; d += 26) {
    line(d, 0, d + H, H, [232, 222, 196], 1);
  }
  // outer frame
  for (let i = 0; i < 3; i++) {
    hline(10 + i, W - 10 - i, 10 + i, NAVY);
    hline(10 + i, W - 10 - i, H - 11 - i, NAVY);
    vline(10 + i, 10, H - 10, NAVY);
    vline(W - 11 - i, 10, H - 10, NAVY);
  }
  // centre gutter (the fold of the open passport)
  fillRect(508, 12, 4, H - 24, [200, 190, 164]);
  vline(507, 12, H - 12, [160, 148, 118], 1);
  vline(513, 12, H - 12, [160, 148, 118], 1);

  // ================= LEFT PAGE — data page =================
  const L = 28; // left margin
  const R = 496; // right edge of left page
  textCentered((L + R) / 2, 26, "REPUBLIC OF THALVARIS", 3, NAVY);
  textCentered((L + R) / 2, 52, "PASSPORT  -  PASSEPORT", 1, BORDO);
  hline(L, R, 68, NAVY, 2);
  hline(L, R, 72, GOLD, 1);

  // emblem + document line
  emblem(64, 108, 26);
  text(102, 92, "TYPE / TYPE", 1, GREY);
  text(102, 103, "P", 2, INK);
  text(192, 92, "CODE / CODE", 1, GREY);
  text(192, 103, "THV", 2, INK);
  text(282, 92, "PASSPORT NO. / NO. DU PASSEPORT", 1, GREY);
  text(282, 103, "TH 482 917", 2, INK);
  text(102, 128, "ISSUING AUTHORITY / AUTORITE", 1, GREY);
  text(102, 139, "HAVSTRAND PASSPORT OFFICE", 1, NAVY);

  // portrait (left) + personal fields (right of it)
  drawPortrait(40, 168, 132, 172);
  textCentered(106, 348, "PHOTOGRAPH", 1, GREY);
  const fx = 192;
  field(fx, 168, "SURNAME / NOM", "ELLINGSEN", 2, 288);
  field(fx, 208, "GIVEN NAMES / PRENOMS", "MARA INGRID", 2, 288);
  field(fx, 248, "NATIONALITY / NATIONALITE", "THALVARIN", 2, 288);
  field(fx, 288, "DATE OF BIRTH / DATE DE NAISSANCE", "14 MAR 1988", 2, 288);
  fieldNoRule(fx, 328, "PLACE OF BIRTH / LIEU DE NAISSANCE", "HAVSTRAND, THALVARIS", 2);
  text(fx, 368, "SEX / SEXE", 1, GREY);
  text(fx, 379, "F", 2, INK);
  text(fx + 100, 368, "HEIGHT / TAILLE", 1, GREY);
  text(fx + 100, 379, "1.71 M", 2, INK);
  text(fx, 398, "OCCUPATION / PROFESSION", 1, GREY);
  text(fx, 409, "FOG-FERRY KEEPER", 2, INK);

  // issue / expiry row
  hline(L, R, 428, NAVY, 1);
  field(L + 12, 442, "DATE OF ISSUE / DELIVRANCE", "02 JUN 2023", 2, 200);
  field(282, 442, "DATE OF EXPIRY / EXPIRATION", "02 JUN 2033", 2, 200);
  text(L + 12, 492, "HOLDER'S SIGNATURE / SIGNATURE DU TITULAIRE", 1, GREY);
  // signature: a flowing hand
  line(L + 12, 522, L + 60, 508, INK, 2);
  line(L + 60, 508, L + 96, 524, INK, 2);
  line(L + 96, 524, L + 140, 506, INK, 2);
  line(L + 140, 506, L + 176, 520, INK, 2);
  text(L + 190, 508, "M. ELLINGSEN", 1, INK);
  hline(L + 12, L + 176, 528, [190, 182, 160]);

  // MRZ — two lines, OCR-style, bottom of the data page
  fillRect(L - 4, 548, R - L + 8, 62, [238, 232, 214]);
  text(L + 6, 556, MRZ1, 2, INK, 0, -2);
  text(L + 6, 580, MRZ2, 2, INK, 0, -2);

  // ================= RIGHT PAGE — visa page =================
  const VL = 532;
  const VR = 996;
  textCentered((VL + VR) / 2, 26, "VISAS", 3, NAVY);
  textCentered((VL + VR) / 2, 52, "VISAS  -  ENDORSEMENTS", 1, BORDO);
  hline(VL, VR, 68, NAVY, 2);
  hline(VL, VR, 72, GOLD, 1);

  // Travel history — all after issue (02 JUN 2023), in order:
  //  Drevania in 17 AUG 2023, out 24 AUG 2023;
  //  Ostermark in 09 FEB 2024;  Kaldrvik in 03 OCT 2024, out 06 OCT 2024.
  stampRound(640, 158, 62, -9, STAMP_BLUE,
    ["KINGDOM OF", "DREVANIA", "ENTRY", "17 AUG 2023", "PORT OF DREVNA"]);
  stampRound(880, 158, 62, 8, STAMP_BLUE,
    ["KINGDOM OF", "DREVANIA", "DEPARTURE", "24 AUG 2023", "PORT OF DREVNA"]);
  stampRect(560, 252, 190, 92, -4, STAMP_GREEN,
    ["REPUBLIC OF OSTERMARK", "ENTRY  -  09 FEB 2024", "OSTERHAVN FERRY TERMINAL", "STAY 30 DAYS"]);
  stampRound(872, 300, 60, 6, STAMP_RED,
    ["FREE CITY OF", "KALDRVIK", "ENTRY", "03 OCT 2024"]);
  stampRound(648, 420, 58, -6, STAMP_RED,
    ["FREE CITY OF", "KALDRVIK", "DEPARTURE", "06 OCT 2024"]);

  // Fee stamp: the ferry keeper pays the tide fee at her own harbour.
  stampRect(772, 392, 200, 76, 3, BORDO,
    ["TIDE FEE PAID", "12 KOR  -  02 JUN 2023", "HAVSTRAND HARBOUR"]);

  // The telling detail: conditions + tide table.
  fillRect(VL, 512, VR - VL, 96, [240, 234, 216]);
  for (let i = 0; i < 2; i++) {
    hline(VL + i, VR - i, 512 + i, NAVY);
    hline(VL + i, VR - i, 607 - i, NAVY);
    vline(VL + i, 512, 608, NAVY);
    vline(VR - 1 - i, 512, 608, NAVY);
  }
  text(VL + 12, 522, "CONDITIONS / CONDITIONS", 1, BORDO);
  text(VL + 12, 538, "1. HOLDER MAY CROSS THE HAVSTRAND CAUSEWAY", 1, INK);
  text(VL + 12, 552, "   AT LOW WATER ONLY. SEE TIDE TABLE P. 14.", 1, INK);
  text(VL + 12, 566, "2. FERRY LICENCE NO. FK-114 VALID WHILE THIS", 1, INK);
  text(VL + 12, 580, "   PASSPORT IS VALID. FOG SIGNALS: 2 LONG, 1 SHORT.", 1, INK);
  text(VL + 12, 594, "TIDE TABLE - HAVSTRAND 03 OCT 2024: LOW WATER 04:12 - 16:38", 1, NAVY);

  // small footer: page numbers, as on a real spread
  textCentered((L + R) / 2, 676, "PAGE 2 - 3  -  THALVARIS", 1, GREY);
  textCentered((VL + VR) / 2, 676, "THIS PASSPORT CONTAINS 32 PAGES", 1, GREY);
  textCentered((VL + VR) / 2, 694, "IF FOUND PLEASE RETURN TO HAVSTRAND PASSPORT OFFICE", 1, GREY);
}

build();
mkdirSync("/output", { recursive: true });
writePNG("/output/entry.png");
