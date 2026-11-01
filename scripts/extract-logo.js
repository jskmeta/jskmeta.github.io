import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function extractLogos() {
  const inputPath = path.join(rootDir, "images/jsk-meta-llc-logo.jpg");
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  const alphaChannel = new Float32Array(width * height);
  const fgRChannel = new Uint8Array(width * height);
  const fgGChannel = new Uint8Array(width * height);
  const fgBChannel = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const t = y / height;
    const bgR = 65 * (1 - t) + 30 * t;
    const bgG = 68 * (1 - t) + 32 * t;
    const bgB = 73 * (1 - t) + 37 * t;

    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 3;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;

      const diffRB = r - b;
      const diffGB = g - b;
      const warmth = diffRB * 1.2 + diffGB * 0.6;

      if (x < 220 || x > 805 || y < 115 || y > 685) {
        alphaChannel[i] = 0;
        continue;
      }

      let alpha = 0;

      if (warmth > 4 && sat > 0.08) {
        if (warmth >= 18) {
          alpha = 1.0;
        } else {
          const norm = (warmth - 4) / 14;
          alpha = norm * norm * (3 - 2 * norm);
        }
      }

      if (y >= 610 && y <= 678) {
        if (warmth > 3 && (diffRB > 2 || sat > 0.08)) {
          const norm = Math.min(1, Math.max(0, (warmth - 3) / 12));
          alpha = Math.max(alpha, norm * norm * (3 - 2 * norm));
        }
      }

      if (alpha > 0.01) {
        let fR = (r - (1 - alpha) * bgR) / alpha;
        let fG = (g - (1 - alpha) * bgG) / alpha;
        let fB = (b - (1 - alpha) * bgB) / alpha;

        fR = Math.min(255, Math.max(0, Math.round(fR)));
        fG = Math.min(255, Math.max(0, Math.round(fG)));
        fB = Math.min(255, Math.max(0, Math.round(fB)));

        if (fR < fB + 10) {
          fR = Math.min(255, Math.max(fR, r));
          fB = Math.max(0, Math.min(fB, Math.round(r * 0.5)));
        }

        fgRChannel[i] = fR;
        fgGChannel[i] = fG;
        fgBChannel[i] = fB;
        alphaChannel[i] = alpha;
      } else {
        alphaChannel[i] = 0;
      }
    }
  }

  const fullOut = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const a = alphaChannel[i];
    const outIdx = i * 4;
    if (a > 0.02) {
      fullOut[outIdx] = fgRChannel[i];
      fullOut[outIdx + 1] = fgGChannel[i];
      fullOut[outIdx + 2] = fgBChannel[i];
      fullOut[outIdx + 3] = Math.round(a * 255);
    } else {
      fullOut[outIdx] = 0;
      fullOut[outIdx + 1] = 0;
      fullOut[outIdx + 2] = 0;
      fullOut[outIdx + 3] = 0;
    }
  }

  const fullTrimmed = await sharp(fullOut, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  const fullTrimmedPath = path.join(rootDir, "images/jsk-meta-llc-logo.png");
  await sharp(fullTrimmed).toFile(fullTrimmedPath);
  console.log("Saved full trimmed logo to", fullTrimmedPath);

  // Extract square emblem icon mark from the top
  const { data: trimmedData, info: trimmedInfo } = await sharp(fullTrimmedPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = trimmedInfo.width,
    maxX = 0,
    minY = trimmedInfo.height,
    maxY = 0;
  for (let y = 0; y < 348; y++) {
    for (let x = 0; x < trimmedInfo.width; x++) {
      const a = trimmedData[(y * trimmedInfo.width + x) * 4 + 3];
      if (a > 20) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const emblemW = maxX - minX + 1;
  const emblemH = maxY - minY + 1;
  const maxDim = Math.max(emblemW, emblemH);
  const padX = Math.round((maxDim - emblemW) / 2);
  const padY = Math.round((maxDim - emblemH) / 2);
  const border = 24;

  const emblemExtract = await sharp(fullTrimmedPath)
    .extract({ left: minX, top: minY, width: emblemW, height: emblemH })
    .png()
    .toBuffer();

  const logoPath = path.join(rootDir, "images/logo.png");
  await sharp(emblemExtract)
    .extend({
      top: border + padY,
      bottom: border + (maxDim - emblemH - padY),
      left: border + padX,
      right: border + (maxDim - emblemW - padX),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(logoPath);

  console.log("Saved square emblem logo to", logoPath);
}

extractLogos().catch(console.error);
