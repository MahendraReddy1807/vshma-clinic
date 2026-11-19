const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Ensure directories exist
const publicDir = path.join(__dirname, '..', 'public');
const appDir = path.join(__dirname, '..', 'src', 'app');

// 1. Solid Forest Green Variant (#183D32)
// Symbol: Ivory (#FAF9F4) with Sage Green (#8BA895) leaf accent
const svgSolid = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="112" fill="#183D32" />
  
  <!-- Subtle luxury inset hairline -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="#8BA895" stroke-opacity="0.25" stroke-width="3" />

  <g transform="translate(0, 4)">
    <!-- Left Stately Downstroke of 'V' in Warm Ivory -->
    <path 
      d="M136 142 L198 142 L256 348 L274 348 L202 142 L136 142 Z" 
      fill="#FAF9F4" 
    />
    
    <!-- Main Classical Stem of 'V' -->
    <path 
      d="M172 142 L256 386 L308 206 C302 216 294 228 284 238 L256 338 L198 142 Z" 
      fill="#FAF9F4" 
    />
    
    <!-- Clean Solid Left Arm -->
    <polygon points="144,142 196,142 256,380 234,380" fill="#FAF9F4" />
    
    <!-- Right Upstroke of 'V' -->
    <polygon points="234,380 256,380 348,154 322,154" fill="#FAF9F4" />

    <!-- Organic Botanical Leaf Accent in Sage Green (#8BA895) -->
    <!-- Elegantly branching from the right terminal of the V -->
    <path 
      d="M344 156 C344 116 382 92 408 92 C410 118 392 166 344 184 C342 172 344 162 344 156 Z" 
      fill="#8BA895" 
    />
    
    <!-- Small Leaf Inner Vein / Sprout in Ivory (#FAF9F4) -->
    <path 
      d="M350 162 C368 152 388 132 396 114 C386 128 370 144 350 154 Z" 
      fill="#FAF9F4" 
      opacity="0.85" 
    />

    <!-- Delicate Secondary Dewdrop/Bud in Ivory -->
    <circle cx="332" cy="196" r="6" fill="#8BA895" />
  </g>
</svg>`;

// 2. Pure Minimalist Luxury Vector Monogram (Precision Vector Definition)
// High-contrast, mathematically centered, recognizable at 16x16 & 32x32
const createMonogramSvg = (bg = '#183D32', rounded = true) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${bg !== 'transparent' ? `<rect width="512" height="512" ${rounded ? 'rx="112"' : ''} fill="${bg}" />` : ''}
  
  <g id="vshma-monogram" transform="translate(0, 0)">
    <!-- Classical Left Serif / Terminal -->
    <path d="M128 140 L196 140 L196 154 L176 154 L244 374 L268 374 L340 154 L320 154 L320 140 L380 140 L380 154 L358 154 L276 394 L236 394 L148 154 L128 154 Z" fill="#FAF9F4" />

    <!-- Botanical Leaf Integration: Sprouting from upper right arm -->
    <path d="M348 154 C350 110 392 88 424 86 C426 118 402 168 348 186 C346 174 348 162 348 154 Z" fill="#8BA895" />
    
    <!-- Botanical Leaf Central Vein in Ivory -->
    <path d="M354 162 C376 148 400 126 412 104 C400 122 378 142 354 152 Z" fill="#FAF9F4" opacity="0.9" />

    <!-- Natural Dewdrop Accent in Sage Green -->
    <circle cx="332" cy="204" r="7" fill="#8BA895" opacity="0.9" />
  </g>
</svg>`;

const svgSolidClean = createMonogramSvg('#183D32', true);
const svgTransparent = createMonogramSvg('transparent', false);

// Helper to assemble Windows .ICO file from PNG buffers (16x16, 32x32, 48x48)
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
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Offset to image data

    entries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...entries, ...imageBuffers]);
}

async function generate() {
  console.log('Generating VSHMA brand icons...');

  // 1. Write SVG variants
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgSolidClean, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon-transparent.svg'), svgTransparent, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgSolidClean, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'icon-transparent.svg'), svgTransparent, 'utf8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgSolidClean, 'utf8');
  console.log('✓ SVGs written (solid & transparent)');

  // 2. Generate PNGs using Sharp
  const svgBuffer = Buffer.from(svgSolidClean);

  // 512x512
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);
  console.log('✓ icon-512.png (512x512)');

  // 192x192
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  console.log('✓ icon-192.png (192x192)');

  // Apple touch icon (180x180)
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  console.log('✓ apple-touch-icon.png (180x180)');

  // 3. Generate Multi-layer favicon.ico (16, 32, 48)
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { buffer: png16, size: 16 },
    { buffer: png32, size: 32 },
    { buffer: png48, size: 48 },
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico (16x16, 32x32, 48x48 multi-resolution packed)');

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
