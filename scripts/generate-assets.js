import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const imagesDir = path.join(rootDir, "images");

async function generateAssets() {
  const svgPath = path.join(imagesDir, "logo.svg");
  const logoSvg = fs.readFileSync(svgPath, "utf8");

  // 1. Render images/logo.png (512x512 transparent PNG)
  const pngPath = path.join(imagesDir, "logo.png");
  await sharp(Buffer.from(logoSvg))
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(pngPath);
  console.log("Generated", pngPath);

  // 2. Render high-res logo mark for OG card (220x220)
  const ogMarkBuf = await sharp(Buffer.from(logoSvg))
    .resize(220, 220, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 3. Generate images/og-card.png (1200x630)
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
