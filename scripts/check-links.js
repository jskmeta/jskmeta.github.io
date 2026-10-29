import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const htmlFiles = fs.readdirSync(rootDir).filter((f) => f.endsWith(".html"));
let hasErrors = false;

console.log(`Checking internal links and assets across ${htmlFiles.length} HTML files...`);

for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract all href and src attributes
  const hrefMatches = [...content.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
  const srcMatches = [...content.matchAll(/src=["']([^"']+)["']/g)].map((m) => m[1]);

  // Check assets (src)
  for (const src of srcMatches) {
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//")) continue;
    const resolvedPath = path.join(rootDir, src);
    if (!fs.existsSync(resolvedPath)) {
      console.error(`::error file=${file}::Broken asset link: src="${src}" not found on disk`);
      hasErrors = true;
    }
  }

  // Check hrefs
  for (const href of hrefMatches) {
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:"))
      continue;

    const [targetFile, targetHash] = href.split("#");
    const actualTargetFile = targetFile ? targetFile : file;
    const targetFilePath = path.join(rootDir, actualTargetFile);

    if (!fs.existsSync(targetFilePath)) {
      console.error(
        `::error file=${file}::Broken link: href="${href}" target file "${actualTargetFile}" not found`
      );
      hasErrors = true;
      continue;
    }

    if (targetHash) {
      const targetContent = fs.readFileSync(targetFilePath, "utf-8");
      const idRegex = new RegExp(`id=["']${targetHash}["']`, "i");
      if (!idRegex.test(targetContent)) {
        console.error(
          `::error file=${file}::Broken anchor: href="${href}" anchor #${targetHash} not found in ${actualTargetFile}`
        );
        hasErrors = true;
      }
    }
  }
}

if (hasErrors) {
  console.error("Link & asset integrity check failed!");
  process.exit(1);
} else {
  console.log("All internal links, anchors, and assets verified successfully!");
}
