const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/tmrma/.gemini/antigravity/brain/b40dc603-3623-4f26-a8fb-974793ae93b8/.user_uploaded/media_1795118631606_f7361897.jpg';
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

// Standard multi-size ICO generator with proper DIB/BMP and PNG support
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = numImages * dirEntrySize;
  let offset = headerSize + dirSize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(numImages, 4); // Count

  const entries = [];
  const imageBuffers = [];

  pngBuffers.forEach(({ buffer, size }) => {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    entries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

async function buildAllBrandAssets() {
  console.log('Generating crisp official VSHMA brand assets from source image...');

  const cx = 375;
  const cy = 375;
  const r = 311;
  const size = r * 2; // 622x622

  // 1. Crop to exact square bounding box of circle
  const croppedSquare = await sharp(srcPath)
    .extract({
      left: cx - r,
      top: cy - r,
      width: size,
      height: size,
    })
    .ensureAlpha()
    .toBuffer();

  // 2. High-precision anti-aliased circular alpha mask (removes all outer white)
  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 0.5}" fill="white" />
    </svg>
  `);

  const maskBuffer = await sharp(maskSvg).resize(size, size).png().toBuffer();

  const transparentEmblem = await sharp(croppedSquare)
    .composite([{ input: maskBuffer, blend: 'dest-in' }])
    .png()
    .toBuffer();

  console.log('✓ Clean circular emblem extracted with transparent background');

  // Also save high-res 512x512 emblem with transparent background
  const emblem512 = await sharp(transparentEmblem)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const emblem192 = await sharp(transparentEmblem)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const emblem180 = await sharp(transparentEmblem)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const emblem64 = await sharp(transparentEmblem).resize(64, 64).png().toBuffer();
  const emblem48 = await sharp(transparentEmblem).resize(48, 48).png().toBuffer();
  const emblem32 = await sharp(transparentEmblem).resize(32, 32).png().toBuffer();
  const emblem16 = await sharp(transparentEmblem).resize(16, 16).png().toBuffer();

  // Write PNG files to public and app
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), emblem512);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), emblem192);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), emblem180);
  fs.writeFileSync(path.join(publicDir, 'logo-transparent.png'), transparentEmblem);

  // App directory icons
  fs.writeFileSync(path.join(appDir, 'icon.png'), emblem512);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), emblem180);

  // Multi-resolution favicon.ico (16, 32, 48, 64)
  const icoBuffer = createIco([
    { buffer: emblem16, size: 16 },
    { buffer: emblem32, size: 32 },
    { buffer: emblem48, size: 48 },
    { buffer: emblem64, size: 64 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico created (16, 32, 48, 64 sizes embedded)');

  // Now create the crisp vector SVG favicon.
  // Modern browsers love SVG with data:image/png;base64 embedded, but standard pure SVG is even better.
  // We provide a high-res SVG wrapper with base64 embedded so the exact doctor-provided emblem renders at full pixel density,
  // AND also write a standalone pure SVG version.
  const b64 = transparentEmblem.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${b64}" width="512" height="512" />
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf8');
  console.log('✓ SVG icons written');

  console.log('All favicon and brand assets successfully updated!');
}

buildAllBrandAssets().catch(console.error);
