import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { buildPhotos } from "./build-photos.mjs";

async function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), "photo-build-"));
  try {
    mkdirSync(join(root, "src"));
    mkdirSync(join(root, "photo-originals"));
    writeFileSync(join(root, "src/photos.html"), readFileSync(new URL("../src/photos.html", import.meta.url)));
    const translations = JSON.parse(readFileSync(new URL("../translations.json", import.meta.url), "utf8"));
    for (const strings of Object.values(translations)) Object.assign(strings, {
      "test.title": "Forest", "test.description": "A forest series.", "test.alt": "A tree.",
    });
    const pages = new Map();
    const options = {
      root, site: "https://example.com", translations, year: "2026",
      translator: (locale) => (key) => {
        if (!translations[locale][key]) throw new Error(`Missing translation: ${key}`);
        return translations[locale][key];
      },
      escape: (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;"),
      write: (file, html) => pages.set(file, html),
    };
    await run({ root, pages, options });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("empty index contains no images or gallery links", () => fixture(async ({ root, pages, options }) => {
  writeFileSync(join(root, "photos.json"), '{"projects":[]}');
  const { groups } = await buildPhotos(options);
  assert.equal(groups.length, 1);
  assert.equal(pages.size, 2);
  assert.doesNotMatch(pages.get("photos/index.html"), /<img|<picture/);
  assert.match(pages.get("de/photos/index.html"), /Fotografie/);
}));

test("gallery produces responsive, stripped, upright variants and localized links", () => fixture(async ({ root, pages, options }) => {
  await sharp({ create: { width: 900, height: 600, channels: 3, background: "green" } })
    .withMetadata({ orientation: 6 }).jpeg().toFile(join(root, "photo-originals/tree.jpg"));
  const project = { slug: "forest", titleKey: "test.title", descriptionKey: "test.description", images: [
    { file: "tree.jpg", altKey: "test.alt" }, { file: "tree.jpg", altKey: "test.alt" },
  ] };
  writeFileSync(join(root, "photos.json"), JSON.stringify({ projects: [project] }));
  const { groups } = await buildPhotos(options);
  assert.equal(groups.length, 2);
  const html = pages.get("photos/forest/index.html");
  assert.match(html, /width="600" height="900"/);
  assert.match(html, /loading="eager" fetchpriority="high"/);
  assert.match(html, /loading="lazy"/);
  assert.match(html, /image\/avif/);
  assert.match(html, /image\/webp/);
  assert.match(html, /href="\/de\/photos\/forest\/"/);
  assert.doesNotMatch(html, /photo-originals/);
  const url = html.match(/src="(\/img\/photos\/[^\"]+)"/)[1];
  const meta = await sharp(join(root, url.slice(1))).metadata();
  assert.equal(meta.width, 600);
  assert.equal(meta.height, 900);
  assert.equal(meta.exif, undefined);
  assert.equal(meta.orientation, undefined);
  const firstHtml = html;
  await buildPhotos(options);
  assert.equal(pages.get("photos/forest/index.html"), firstHtml);
  project.images[0].file = "../private.jpg";
  writeFileSync(join(root, "photos.json"), JSON.stringify({ projects: [project] }));
  await assert.rejects(buildPhotos(options), /outside photo-originals/);
}));
