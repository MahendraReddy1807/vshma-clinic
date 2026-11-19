const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcImagePath = 'C:/Users/tmrma/.gemini/antigravity/brain/b40dc603-3623-4f26-a8fb-974793ae93b8/.user_uploaded/media_1795118631606_f7361897.jpg';
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

// Multi-layer ICO generator
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
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buffer.length, 8);
    entry.writeUInt32LE(offset, 12);

    entries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

async function processLogo() {
  console.log('Processing official logo into 3D medallion...');

  // 1. Load original 751x751 image
  const rawMetadata = await sharp(srcImagePath).metadata();
  const width = rawMetadata.width;
  const height = rawMetadata.height;
  const cx = width / 2; // 375.5
  const cy = height / 2; // 375.5
  const radius = 312; // Outer circle radius

  const emblemSize = radius * 2; // 624x624
  const extractLeft = Math.round(cx - radius);
  const extractTop = Math.round(cy - radius);

  // Extract square emblem region first
  const croppedSquare = await sharp(srcImagePath)
    .extract({
      left: extractLeft,
      top: extractTop,
      width: emblemSize,
      height: emblemSize,
    })
    .ensureAlpha()
    .png()
    .toBuffer();

  // Create smooth anti-aliased circular alpha mask matching emblemSize
  const circleMaskSvg = Buffer.from(`
    <svg width="${emblemSize}" height="${emblemSize}" viewBox="0 0 ${emblemSize} ${emblemSize}">
      <circle cx="${emblemSize / 2}" cy="${emblemSize / 2}" r="${emblemSize / 2}" fill="white" />
    </svg>
  `);

  const circleMask = await sharp(circleMaskSvg)
    .resize(emblemSize, emblemSize)
    .png()
    .toBuffer();

  // Extract circular emblem with transparent background
  const transparentEmblem = await sharp(croppedSquare)
    .composite([
      {
        input: circleMask,
        blend: 'dest-in',
      },
    ])
    .png()
    .toBuffer();

  // 3. Create 3D Lighting, Bevel, Glass Shimmer & Shadow Overlays
  // We composite:
  // - Ambient rim lighting (top-left highlight, bottom-right deep shade)
  // - Specular dome gloss curve (giving it that physical 3D luxury coin / medallion feel)
  // - Inner drop-shadow on the leaf and V
  const lightingOverlaySvg = Buffer.from(`
    <svg width="${emblemSize}" height="${emblemSize}" viewBox="0 0 ${emblemSize} ${emblemSize}">
      <defs>
        <!-- Top-left 3D dome gloss highlight -->
        <linearGradient id="domeGloss" x1="0.2" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35" />
          <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.10" />
          <stop offset="60%" stop-color="#FFFFFF" stop-opacity="0.0" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.25" />
        </linearGradient>

        <!-- Rim Bevel (Bright light at top-left, depth shadow at bottom-right) -->
        <linearGradient id="rimLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#FAF9F4" stop-opacity="0.6" />
          <stop offset="40%" stop-color="#8BA895" stop-opacity="0.2" />
          <stop offset="70%" stop-color="#000000" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
        </linearGradient>

        <!-- Specular Crescent Shimmer on top arc -->
        <radialGradient id="specularGlint" cx="35%" cy="25%" r="45%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.32" />
          <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0" />
        </radialGradient>
      </defs>

      <!-- 3D Bevel Rim -->
      <circle cx="${emblemSize / 2}" cy="${emblemSize / 2}" r="${emblemSize / 2 - 2}" fill="none" stroke="url(#rimLight)" stroke-width="4.5" />

      <!-- Overall 3D Dome Lighting -->
      <circle cx="${emblemSize / 2}" cy="${emblemSize / 2}" r="${emblemSize / 2 - 2}" fill="url(#domeGloss)" mix-blend-mode="overlay" />

      <!-- Top Specular Crescent Shimmer -->
      <ellipse cx="${emblemSize / 2}" cy="${emblemSize * 0.28}" rx="${emblemSize * 0.38}" ry="${emblemSize * 0.18}" fill="url(#specularGlint)" />
    </svg>
  `);

  const lightingOverlay = await sharp(lightingOverlaySvg)
    .resize(emblemSize, emblemSize)
    .png()
    .toBuffer();

  // Combine original clean emblem with 3D lighting
  const emblemWith3dLighting = await sharp(transparentEmblem)
    .composite([
      {
        input: lightingOverlay,
        blend: 'over',
      },
    ])
    .toBuffer();

  // 4. Place onto a 700x700 canvas with a soft, rich 3D drop-shadow
  // so the medallion physically floats off the page
  const canvasSize = 680;
  const shadowSvg = Buffer.from(`
    <svg width="${canvasSize}" height="${canvasSize}" viewBox="0 0 ${canvasSize} ${canvasSize}">
      <defs>
        <filter id="medallionShadow" x="-20%" y="-20%" width="150%" height="150%">
          <feDropShadow dx="0" dy="16" stdDeviation="22" flood-color="#091f18" flood-opacity="0.45" />
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#091f18" flood-opacity="0.35" />
        </filter>
      </defs>
      <circle cx="${canvasSize / 2}" cy="${canvasSize / 2 - 4}" r="${emblemSize / 2}" fill="#183D32" filter="url(#medallionShadow)" />
    </svg>
  `);

  const shadowLayer = await sharp(shadowSvg)
    .resize(canvasSize, canvasSize)
    .png()
    .toBuffer();

  // Master 3D Medallion with transparent drop shadow (700x700)
  const master3dMedallion = await sharp(shadowLayer)
    .composite([
      {
        input: emblemWith3dLighting,
        top: Math.round((canvasSize - emblemSize) / 2 - 4),
        left: Math.round((canvasSize - emblemSize) / 2),
      },
    ])
    .png()
    .toBuffer();

  // Save full-res master 3D transparent emblem
  fs.writeFileSync(path.join(publicDir, 'brand-logo-3d.png'), master3dMedallion);
  fs.writeFileSync(path.join(publicDir, 'logo-transparent.png'), emblemWith3dLighting);
  console.log('✓ Master 3D logo rendered & saved');

  // 5. Generate Target PNGs:
  // - icon-512.png (512x512)
  const icon512 = await sharp(master3dMedallion)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  fs.writeFileSync(path.join(appDir, 'icon.png'), icon512);
  console.log('✓ icon-512.png (512x512 transparent)');

  // - icon-192.png (192x192)
  const icon192 = await sharp(master3dMedallion)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  console.log('✓ icon-192.png (192x192 transparent)');

  // - apple-touch-icon.png (180x180)
  // iOS prefers a solid background or squircle. Let's place the 3D medallion on a rich forest green squircle
  const appleSvg = Buffer.from(`
    <svg width="180" height="180" viewBox="0 0 180 180">
      <rect width="180" height="180" rx="40" fill="#183D32" />
      <rect x="3" y="3" width="174" height="174" rx="37" fill="none" stroke="#FAF9F4" stroke-opacity="0.15" stroke-width="1.5" />
    </svg>
  `);
  const appleBg = await sharp(appleSvg).toBuffer();
  const appleMedallion = await sharp(emblemWith3dLighting).resize(144, 144).png().toBuffer();
  const appleTouchIcon = await sharp(appleBg)
    .composite([{ input: appleMedallion, top: 18, left: 18 }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleTouchIcon);
  console.log('✓ apple-touch-icon.png (180x180 iOS squircle)');

  // 6. Generate multi-resolution favicon.ico (16x16, 32x32, 48x48)
  const ico16 = await sharp(emblemWith3dLighting).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(emblemWith3dLighting).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(emblemWith3dLighting).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { buffer: ico16, size: 16 },
    { buffer: ico32, size: 32 },
    { buffer: ico48, size: 48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico (16, 32, 48 packed)');

  // 7. Generate clean 3D-filtered SVG variants for vector clarity
  // We embed the high-res 3D emblem as an SVG element with gradient lighting so it scales infinitely
  const base64Emblem = emblemWith3dLighting.toString('base64');
  const svg3d = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="dropShadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#091f18" flood-opacity="0.4" />
      <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#091f18" flood-opacity="0.3" />
    </filter>
  </defs>
  <g filter="url(#dropShadow)">
    <image href="data:image/png;base64,${base64Emblem}" x="16" y="10" width="480" height="480" />
  </g>
</svg>`;

  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg3d, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg3d, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svg3d, 'utf8');
  console.log('✓ favicon.svg and icon.svg written');

  console.log('All 3D branding assets successfully generated!');
}

processLogo().catch(err => {
  console.error('Processing failed:', err);
  process.exit(1);
});
