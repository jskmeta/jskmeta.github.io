import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const squintScreenshotsDir = path.resolve(rootDir, "../squint/docs/assets/screenshots");
const imagesDir = path.join(rootDir, "images");

async function createRealMockup() {
  const iosLivePath = path.join(squintScreenshotsDir, "ios/live-view.png");
  const freezePath = path.join(squintScreenshotsDir, "freeze-inspect.png");

  console.log("Reading real iOS screenshot from", iosLivePath);
  const liveMeta = await sharp(iosLivePath).metadata();
  console.log("Live view dimensions:", liveMeta.width, liveMeta.height);

  // We want to create an iPhone device frame around the real 786x1704 screen:
  // Bezel width: ~24px on all sides
  // Phone body: (786 + 48) x (1704 + 48) = 834 x 1752
  const screenW = liveMeta.width;
  const screenH = liveMeta.height;
  const bezel = 24;
  const phoneW = screenW + bezel * 2;
  const phoneH = screenH + bezel * 2;
  const cornerRadius = 110;
  const screenRadius = 90;

  // SVG frame with titanium edge, antenna lines, and Dynamic Island
  const frameSvg = `
<svg width="${phoneW}" height="${phoneH}" viewBox="0 0 ${phoneW} ${phoneH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Titanium gradient -->
    <linearGradient id="titanium" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4a4c52" />
      <stop offset="30%" stop-color="#8e9098" />
      <stop offset="50%" stop-color="#38393e" />
      <stop offset="70%" stop-color="#9ea0aa" />
      <stop offset="100%" stop-color="#2c2d32" />
    </linearGradient>

    <!-- Inner bezel border -->
    <linearGradient id="inner-bezel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1c1d22" />
      <stop offset="100%" stop-color="#0a0b0e" />
    </linearGradient>
  </defs>

  <!-- Outer Titanium Chassis with authentic rounded corners -->
  <rect x="2" y="2" width="${phoneW - 4}" height="${phoneH - 4}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#titanium)" stroke="#111215" stroke-width="3" />
  
  <!-- Inner dark glass bezel -->
  <rect x="10" y="10" width="${phoneW - 20}" height="${phoneH - 20}" rx="${cornerRadius - 8}" ry="${cornerRadius - 8}" fill="url(#inner-bezel)" />
</svg>
`;

  // Dynamic Island overlay - accurately sized to fit between top control buttons
  // Gap between [Flash] (ends at ~305) and [History] (starts at ~476) is 171px.
  // Island width = 150px, centered at screenW/2 = 393 (left = 318, right = 468)
  const islandW = 150;
  const islandH = 44;
  const islandX = (screenW - islandW) / 2;
  const islandY = 16;
  const dynamicIslandSvg = `
<svg width="${screenW}" height="100" viewBox="0 0 ${screenW} 100" xmlns="http://www.w3.org/2000/svg">
  <!-- Dynamic Island Pill -->
  <rect x="${islandX}" y="${islandY}" width="${islandW}" height="${islandH}" rx="${islandH / 2}" ry="${islandH / 2}" fill="#000000" />
  <!-- Camera lens reflection -->
  <circle cx="${islandX + islandW - 28}" cy="${islandY + islandH / 2}" r="11" fill="#080812" stroke="#161828" stroke-width="2" />
  <!-- Minimal green camera indicator dot -->
  <circle cx="${screenW / 2 + 10}" cy="${islandY + 8}" r="3.5" fill="#30d158" />
</svg>
`;

  // Mask for screen rounded corners
  const screenMaskSvg = `
<svg width="${screenW}" height="${screenH}" viewBox="0 0 ${screenW} ${screenH}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${screenW}" height="${screenH}" rx="${screenRadius}" ry="${screenRadius}" fill="#ffffff" />
</svg>
`;

  const screenMaskBuf = await sharp(Buffer.from(screenMaskSvg)).png().toBuffer();
  const dynamicIslandBuf = await sharp(Buffer.from(dynamicIslandSvg)).png().toBuffer();

  // 1. Process Real iOS Live View
  const maskedLiveScreen = await sharp(iosLivePath)
    .composite([
      { input: screenMaskBuf, blend: "dest-in" },
      { input: dynamicIslandBuf, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  const framedLiveDevice = await sharp(Buffer.from(frameSvg))
    .composite([{ input: maskedLiveScreen, top: bezel, left: bezel }])
    .png()
    .toBuffer();

  // Mask outer corners of entire device to be 100% transparent
  const outerMaskSvg = `
<svg width="${phoneW}" height="${phoneH}" viewBox="0 0 ${phoneW} ${phoneH}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff" />
</svg>
`;
  const outerMaskBuf = await sharp(Buffer.from(outerMaskSvg)).png().toBuffer();

  const finalLive = await sharp(framedLiveDevice)
    .composite([{ input: outerMaskBuf, blend: "dest-in" }])
    .png()
    .toBuffer();

  const outLivePng = path.join(rootDir, "images/squint-device-mockup.png");
  const outLiveWebp = path.join(rootDir, "images/squint-device-mockup.webp");

  await sharp(finalLive).toFile(outLivePng);
  await sharp(finalLive).webp({ quality: 92 }).toFile(outLiveWebp);
  console.log("Saved primary framed live view to", outLivePng, outLiveWebp);

  // 2. Process Freeze Inspect View
  const freezeMeta = await sharp(freezePath).metadata();
  console.log("Freeze inspect dimensions:", freezeMeta.width, freezeMeta.height);

  // Freeze inspect already has top HUD elements across the center, so omit Dynamic Island
  // to avoid obscuring the filter button.
  const freezeResized = await sharp(freezePath)
    .resize(screenW, screenH, { fit: "cover" })
    .composite([{ input: screenMaskBuf, blend: "dest-in" }])
    .png()
    .toBuffer();

  const framedFreezeDevice = await sharp(Buffer.from(frameSvg))
    .composite([{ input: freezeResized, top: bezel, left: bezel }])
    .png()
    .toBuffer();

  const finalFreeze = await sharp(framedFreezeDevice)
    .composite([{ input: outerMaskBuf, blend: "dest-in" }])
    .png()
    .toBuffer();

  const outFreezePng = path.join(rootDir, "images/squint-freeze-inspect.png");
  const outFreezeWebp = path.join(rootDir, "images/squint-freeze-inspect.webp");

  await sharp(finalFreeze).toFile(outFreezePng);
  await sharp(finalFreeze).webp({ quality: 92 }).toFile(outFreezeWebp);
  console.log("Saved framed freeze inspect to", outFreezePng, outFreezeWebp);
}

createRealMockup().catch(console.error);
