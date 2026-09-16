/* Optional authoring utility. Published pages need no Node runtime or build step.
 * Dependencies: playwright 1.62.1, fontkit 2.0.4, sharp 0.35.3.
 * Run: node sarath/branding/build.cjs
 * Chrome must be installed; alternatively use Playwright's bundled Chromium.
 */
"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const fontkit = require("fontkit");
const sharp = require("sharp");
const { chromium } = require("playwright");

const assets = path.resolve(__dirname, "../assets");
const expectedCopy = [
  "SARATH & ASSOCIATES",
  "Chartered Accountants · Since 1990",
  "Perspective",
  "that goes",
  "beyond numbers.",
];

async function build() {
  // Outline the actual site-font glyph so the SVG needs no fonts or network.
  const font = fontkit.openSync(
    path.join(assets, "fonts/source-serif-4-latin.woff2"),
  );
  const glyph = font.glyphForCodePoint("S".codePointAt(0));
  const box = glyph.bbox;
  const scale = 43 / (box.maxY - box.minY);
  const x = (64 - (box.maxX - box.minX) * scale) / 2 - box.minX * scale;
  const y = 53 + box.minY * scale;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <title>Sarath &amp; Associates</title>
  <rect width="64" height="64" rx="12" fill="#15584e"/>
  <path fill="#fcf9f2" transform="translate(${x.toFixed(4)} ${y.toFixed(4)}) scale(${scale.toFixed(6)} -${scale.toFixed(6)})" d="${glyph.path.toSVG()}"/>
</svg>\n`;
  await fs.writeFile(path.join(assets, "favicon.svg"), svg);
  const pixels = new Map();
  for (const size of [16, 32, 48, 180]) {
    // Apple supplies its own home-screen mask; use a solid square there.
    const source = size === 180 ? svg.replace('rx="12"', 'rx="0"') : svg;
    const png = await sharp(Buffer.from(source))
      .resize(size, size)
      .png()
      .toBuffer();
    pixels.set(size, png);
  }
  await fs.writeFile(path.join(assets, "favicon-32.png"), pixels.get(32));
  await fs.writeFile(
    path.join(assets, "apple-touch-icon.png"),
    pixels.get(180),
  );

  // An ICO directory containing lossless PNG entries at native tab sizes.
  const sizes = [16, 32, 48];
  const directory = Buffer.alloc(6 + sizes.length * 16);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  sizes.forEach((size, index) => {
    const start = 6 + index * 16;
    const png = pixels.get(size);
    directory[start] = size;
    directory[start + 1] = size;
    directory.writeUInt16LE(1, start + 4);
    directory.writeUInt16LE(32, start + 6);
    directory.writeUInt32LE(png.length, start + 8);
    directory.writeUInt32LE(offset, start + 12);
    offset += png.length;
  });
  await fs.writeFile(
    path.join(assets, "favicon.ico"),
    Buffer.concat([directory, ...sizes.map((size) => pixels.get(size))]),
  );

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await page.goto(
      pathToFileURL(path.join(__dirname, "social-card.html")).href,
    );
    await page.evaluate(() => document.fonts.ready);
    const state = await page.evaluate(() => ({
      text: document.body.innerText,
      imagesLoaded: [...document.images].every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
      fontsLoaded:
        document.fonts.check('76px "Source Serif 4"') &&
        document.fonts.check('29px "Source Sans 3"'),
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      rightmostText: Math.max(
        ...[...document.querySelectorAll(".copy p, h1 span")].map((element) => {
          const range = document.createRange();
          range.selectNodeContents(element);
          return range.getBoundingClientRect().right;
        }),
      ),
      imageLeft: document.querySelector(".visual").getBoundingClientRect().left,
    }));
    if (
      !expectedCopy.every((text) => state.text.includes(text)) ||
      !state.imagesLoaded ||
      !state.fontsLoaded ||
      state.width !== 1200 ||
      state.height !== 630 ||
      state.rightmostText > state.imageLeft - 20
    ) {
      throw new Error(
        `Sharing card layout check failed: ${JSON.stringify(state)}`,
      );
    }
    await page.screenshot({
      path: path.join(assets, "social-preview-v1.jpg"),
      type: "jpeg",
      quality: 92,
    });
  } finally {
    await browser.close();
  }
  console.log(
    "Generated SVG / ICO / PNG favicon, Apple icon and 1200×630 sharing card.",
  );
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
