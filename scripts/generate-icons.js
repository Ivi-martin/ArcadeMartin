import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, colorR = 9, colorG = 10, colorB = 20) {
  // Create raw RGBA buffer
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Draw circular gold shuriken / emblem
      const cx = width / 2;
      const cy = height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside gold star
      const angle = Math.atan2(dy, dx);
      const starRadius = (width * 0.38) * (0.6 + 0.4 * Math.abs(Math.sin(angle * 2)));

      if (dist < 16) {
        // Center core gold
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 215;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 255;
      } else if (dist < starRadius && dist > 24) {
        // Gold blade
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 200;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 255;
      } else if (dist < width * 0.45 && dist > width * 0.43) {
        // Outer ring
        rawData[pxOffset] = 255;
        rawData[pxOffset + 1] = 215;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 255;
      } else {
        // Dark background
        rawData[pxOffset] = colorR;
        rawData[pxOffset + 1] = colorG;
        rawData[pxOffset + 2] = colorB;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c >>> 0;
}

if (!fs.existsSync('public')) fs.mkdirSync('public');

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180));

console.log('PNG Icons successfully generated in public/');
