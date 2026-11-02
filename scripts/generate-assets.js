import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const imagesDir = path.join(rootDir, "images");

const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Site Accent: Electric Cyan to Cobalt Blue -->
    <linearGradient id="cyan-blue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="60%" stop-color="#3b82f6" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>

    <!-- Electric Cyan to Purple / Indigo -->
    <linearGradient id="cyan-indigo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#60a5fa" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>

    <!-- Dark Glass Squircle Background -->
    <linearGradient id="squircle-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#162238" />
      <stop offset="50%" stop-color="#0d1524" />
      <stop offset="100%" stop-color="#070a12" />
    </linearGradient>

    <!-- Squircle Border -->
    <linearGradient id="squircle-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255, 255, 255, 0.28)" />
      <stop offset="100%" stop-color="rgba(56, 189, 248, 0.35)" />
    </linearGradient>

    <!-- Modern Soft Drop Shadows -->
    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0284c7" flood-opacity="0.32" />
    </filter>
    <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Apple Studio Developer Squircle Base -->
  <g filter="url(#badge-shadow)">
    <rect x="46" y="46" width="420" height="420" rx="96" ry="96" fill="url(#squircle-bg)" stroke="url(#squircle-stroke)" stroke-width="3" />
    <path d="M 65,115 C 65,78 95,54 138,48 L 374,48 C 417,54 447,78 447,115 C 447,140 417,122 374,122 L 138,122 C 95,122 65,140 65,115 Z" fill="#ffffff" opacity="0.06" />
  </g>

  <!-- Luminous Studio JSK Core -->
  <g filter="url(#soft-glow)">
    <!-- J -->
    <path d="M 125,155 L 165,155 L 165,310 C 165,342 145,362 114,362 C 88,362 72,345 72,322 L 105,322 C 105,330 108,335 114,335 C 122,335 125,328 125,310 Z" fill="url(#cyan-blue)" />

    <!-- S (Forward orientation) -->
    <path d="M 285,200 L 250,200 C 250,180 236,168 215,168 C 188,168 170,184 170,206 C 170,228 188,242 222,256 C 268,274 298,300 298,342 C 298,388 258,412 208,412 C 158,412 128,385 128,342 L 162,342 C 162,366 182,382 208,382 C 238,382 262,366 262,342 C 262,318 240,302 205,286 C 162,270 135,246 135,206 C 135,160 170,138 215,138 C 260,138 285,164 285,200 Z" fill="url(#cyan-indigo)" />

    <!-- K -->
    <polygon points="320,155 355,155 355,378 320,378" fill="url(#cyan-blue)" />
    <polygon points="355,268 415,155 452,155 382,284" fill="url(#cyan-indigo)" />
    <polygon points="365,258 452,378 412,378 338,288" fill="url(#cyan-blue)" />
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
    <linearGradient id="cyan-text" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#60a5fa" />
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg-grad)" />
  <rect x="30" y="30" width="1140" height="570" rx="20" ry="20" fill="none" stroke="#1e293b" stroke-width="1.5" stroke-opacity="0.8" />

  <text x="600" y="365" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="800" fill="#ffffff" letter-spacing="2" text-anchor="middle">JSK META</text>
  <text x="600" y="415" font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="700" fill="url(#cyan-text)" letter-spacing="6" text-anchor="middle">INDEPENDENT MOBILE SOFTWARE STUDIO</text>
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
