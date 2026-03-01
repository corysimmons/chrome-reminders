#!/usr/bin/env node
// generate-icons.js — Creates PNG icons for the extension using pure Node.js
// Generates a simple bell icon at 16x16, 48x48, and 128x128

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size) {
  // Draw a simple bell shape on a transparent canvas
  const pixels = Buffer.alloc(size * size * 4, 0); // RGBA

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 24; // Scale factor based on 24x24 viewbox

  // Bell color: Twitter blue #1d9bf0
  const r = 0x1d, g = 0x9b, b = 0xf0, a = 255;

  function setPixel(x, y) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < size && y >= 0 && y < size) {
      const idx = (y * size + x) * 4;
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = a;
    }
  }

  function fillCircle(cx, cy, radius) {
    const r2 = radius * radius;
    for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y++) {
      for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          setPixel(x, y);
        }
      }
    }
  }

  function fillRect(x1, y1, x2, y2) {
    for (let y = Math.floor(y1); y <= Math.ceil(y2); y++) {
      for (let x = Math.floor(x1); x <= Math.ceil(x2); x++) {
        setPixel(x, y);
      }
    }
  }

  // Bell body (dome shape using overlapping circles and rect)
  const bellTop = 4 * scale;
  const bellBottom = 17 * scale;
  const bellWidth = 5 * scale;

  // Top dome
  fillCircle(cx, bellTop + bellWidth, bellWidth);

  // Bell shaft
  fillRect(cx - bellWidth, bellTop + bellWidth, cx + bellWidth, bellBottom);

  // Bottom flare
  fillRect(cx - bellWidth - 1.5 * scale, bellBottom - 1 * scale, cx + bellWidth + 1.5 * scale, bellBottom + 1 * scale);

  // Base line
  fillRect(2 * scale, bellBottom, size - 2 * scale, bellBottom + 1.2 * scale);

  // Clapper (small circle at bottom center)
  fillCircle(cx, bellBottom + 2.8 * scale, 1.5 * scale);

  // Small knob on top
  fillCircle(cx, bellTop - 0.5 * scale, 1.2 * scale);

  return encodePNG(pixels, size, size);
}

function encodePNG(pixels, width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data with filter bytes
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0; // filter: none
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  // Build chunks
  const chunks = [
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat([signature, ...chunks]);
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  const outPath = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(outPath, png);
  console.log(`Generated ${outPath} (${png.length} bytes)`);
}

console.log('Done!');
