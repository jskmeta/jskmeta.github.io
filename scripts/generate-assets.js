import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const imagesDir = path.join(rootDir, "images");

const goldGradients = `
  <defs>
    <!-- Highlight gold -->
    <linearGradient id="gold-light" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5db" />
      <stop offset="40%" stop-color="#f0cb75" />
      <stop offset="80%" stop-color="#cf9e38" />
      <stop offset="100%" stop-color="#9a6e1a" />
    </linearGradient>

    <!-- Midtone gold -->
    <linearGradient id="gold-mid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f5d688" />
      <stop offset="50%" stop-color="#d4a343" />
      <stop offset="100%" stop-color="#8c5e14" />
    </linearGradient>

    <!-- Deep shadow facet -->
    <linearGradient id="gold-shadow" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b08226" />
      <stop offset="50%" stop-color="#7a500e" />
      <stop offset="100%" stop-color="#4d3005" />
    </linearGradient>

    <!-- Horizontal sweep -->
    <linearGradient id="gold-sweep" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#fae2a0" />
      <stop offset="50%" stop-color="#d8ab4e" />
      <stop offset="100%" stop-color="#9b6e1c" />
    </linearGradient>

    <filter id="subtle-drop" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.28" />
    </filter>
  </defs>
`;

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  ${goldGradients}
  <g filter="url(#subtle-drop)">
    <!-- J STEM (Left facet light, Right facet shadow) -->
    <!-- Top terminal cap & stem -->
    <polygon points="108,100 152,100 152,308 108,308" fill="url(#gold-mid)" />
    <polygon points="108,100 130,100 130,308 108,308" fill="url(#gold-light)" />
    
    <!-- J Hook (Bottom curve curling left) -->
    <path d="M 108,308 L 152,308 C 152,352 128,382 86,382 C 58,382 38,358 38,324 L 76,324 C 76,337 82,344 92,344 C 102,344 108,332 108,308 Z" fill="url(#gold-light)" />

    <!-- FORWARD S (Sculpted Center Ribbon in Natural Direction) -->
    <!-- S Main Body: Starts at upper right, curves left over top, sweeps diagonally down-right, curves out to lower right, finishes at bottom left -->
    <path d="M 308,158 L 268,158 C 268,136 248,120 222,120 C 185,120 160,143 160,173 C 160,203 185,223 232,243 C 295,270 335,306 335,362 C 335,424 284,454 215,454 C 152,454 115,421 115,365 L 156,365 C 156,394 178,414 215,414 C 258,414 293,392 293,360 C 293,326 266,303 220,283 C 162,256 120,226 120,173 C 120,113 168,80 224,80 C 282,80 308,114 308,158 Z" fill="url(#gold-light)" />

    <!-- Dimensional Bevel / Chisel Spine on S Waist -->
    <path d="M 232,243 C 295,270 335,306 335,362 L 315,362 C 315,320 284,293 235,270 L 192,250 C 165,236 142,220 128,203 L 138,188 C 156,208 182,223 232,243 Z" fill="url(#gold-shadow)" opacity="0.65" />

    <!-- K LETTER (Right side with bold angled facets) -->
    <!-- K Vertical Stem -->
    <polygon points="352,100 394,100 394,432 352,432" fill="url(#gold-mid)" />
    <polygon points="352,100 373,100 373,432 352,432" fill="url(#gold-light)" />

    <!-- K Upper Diagonal (with chiseled split) -->
    <polygon points="394,254 466,120 510,120 423,276" fill="url(#gold-light)" />
    <polygon points="394,254 423,276 493,148 466,120" fill="url(#gold-shadow)" opacity="0.6" />

    <!-- K Lower Diagonal (with chiseled split) -->
    <polygon points="404,244 510,432 466,432 376,284" fill="url(#gold-mid)" />
    <polygon points="404,244 376,284 442,402 466,432" fill="url(#gold-light)" />
  </g>
</svg>
`;

async function generateAssets() {
  // 1. Write images/logo.svg
  const svgPath = path.join(imagesDir, "logo.svg");
  fs.writeFileSync(svgPath, logoSvg.trim() + "\n", "utf8");
  console.log("Wrote", svgPath);

  // 2. Render images/logo.png (512x512 transparent PNG)
  const pngPath = path.join(imagesDir, "logo.png");
  await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(pngPath);
  console.log("Generated", pngPath);

  // 3. Render high-res logo mark for OG card (220x220)
  const ogMarkBuf = await sharp(Buffer.from(logoSvg))
    .resize(220, 220, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 4. Generate images/og-card.png (1200x630)
  const ogSvgBackground = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg-grad" cx="50%" cy="45%" r="65%">
      <stop offset="0%" stop-color="#141c2e" />
      <stop offset="60%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#04060a" />
    </radialGradient>
    <linearGradient id="gold-text" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f5d688" />
      <stop offset="50%" stop-color="#e2b450" />
      <stop offset="100%" stop-color="#cf9e38" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg-grad)" />
  <rect x="30" y="30" width="1140" height="570" rx="20" ry="20" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.8" />

  <text x="600" y="365" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="2" text-anchor="middle">JSK META</text>
  <text x="600" y="415" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="url(#gold-text)" letter-spacing="6" text-anchor="middle">INDEPENDENT MOBILE SOFTWARE STUDIO</text>
  <text x="600" y="470" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400" fill="#94a3b8" letter-spacing="0.3" text-anchor="middle">Thoughtful, Privacy-First Mobile Utilities &#8226; Zero Ads &#8226; 100% Offline</text>

  <g transform="translate(485, 515)">
    <rect width="230" height="42" rx="21" ry="21" fill="#131b2e" stroke="#253552" stroke-width="1.5" />
    <text x="115" y="27" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="#93c5fd" letter-spacing="1" text-anchor="middle">jskmeta.com</text>
  </g>
</svg>
`;

  const ogCardPath = path.join(imagesDir, "og-card.png");
  await sharp(Buffer.from(ogSvgBackground))
    .composite([
      {
        input: ogMarkBuf,
        top: 80,
        left: Math.round((1200 - 220) / 2),
      },
    ])
    .png({ quality: 95 })
    .toFile(ogCardPath);
  console.log("Generated", ogCardPath);
}

generateAssets().catch(console.error);
