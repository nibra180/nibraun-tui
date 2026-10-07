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
    mkdirSync(join(root, "photo-originals"));
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

test("the teaser leads the gallery and thumbnail without reordering the remaining photos", () => fixture(async ({ root, pages, options }) => {
  const images = [];
  for (const color of ["red", "green", "blue"]) {
    const file = `${color}.jpg`;
    await sharp({ create: { width: 60, height: 40, channels: 3, background: color } })
      .jpeg().toFile(join(root, "photo-originals", file));
    images.push({ file, altKey: "test.alt" });
  }
  for (const selected of [1, 2, 0, null]) {
    const project = { slug: "forest", titleKey: "test.title", descriptionKey: "test.description", images:
      images.map((image, index) => ({ ...image, ...(index === selected ? { teaser: true } : {}) })),
    };
    writeFileSync(join(root, "photos.json"), JSON.stringify({ projects: [project] }));
    const { galleries: [gallery] } = await buildPhotos(options);
    const lead = images[selected ?? 0];
    const expected = [lead, ...images.filter((image) => image !== lead)].map((image) => image.file);
    assert.deepEqual(gallery.images.map((image) => image.file), expected);
    const sources = gallery.images.map((image) => image.variants.jpeg[0].url);
    const fullSources = gallery.images.map((image) => image.variants.jpeg.at(-1).url);
    for (const prefix of ["", "de/"]) {
      const html = pages.get(`${prefix}photos/forest/index.html`);
      const renderedSources = [...html.matchAll(/<img[^>]* src="([^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(renderedSources, sources);
      const imageLinks = [...html.matchAll(/<a class="photo-open" href="([^"]+)" aria-label="([^"]+)"/g)];
      assert.deepEqual(imageLinks.map((match) => match[1]), fullSources);
      assert.ok(imageLinks.every((match) => match[2].includes("A tree.")));
      assert.match(html, /<dialog class="lightbox"/);
      assert.match(html, /class="lightbox-announcement" role="status" aria-atomic="true"/);
      assert.doesNotMatch(pages.get(`${prefix}photos/index.html`), /<dialog/);
      const tags = html.match(/<img[^>]*>/g);
      assert.match(tags[0], /loading="eager" fetchpriority="high"/);
      assert.ok(tags.slice(1).every((tag) => tag.includes('loading="lazy"') && !tag.includes("fetchpriority")));
      const overview = pages.get(`${prefix}photos/index.html`);
      assert.equal(overview.match(/<img[^>]* src="([^"]+)"/)[1], sources[0]);
    }
  }
}));

test("multiple teaser images fail the build", () => fixture(async ({ root, options }) => {
  const project = { slug: "forest", titleKey: "test.title", descriptionKey: "test.description", images: [
    { file: "one.jpg", altKey: "test.alt", teaser: true },
    { file: "two.jpg", altKey: "test.alt", teaser: true },
  ] };
  writeFileSync(join(root, "photos.json"), JSON.stringify({ projects: [project] }));
  await assert.rejects(buildPhotos(options), /Multiple teaser images for forest/);
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
  const overview = pages.get("de/photos/index.html");
  assert.match(overview, /class="photo-project tone-green" href="\/de\/photos\/forest\/"/);
  assert.match(overview, /<picture>/);
  assert.match(overview, /alt="A tree\."/);
  assert.match(overview, /<h2>Forest<\/h2>/);
  assert.doesNotMatch(overview, /<p>A forest series\.<\/p>/);
  const html = pages.get("photos/forest/index.html");
  assert.match(html, /<p class="photos-description">A forest series\.<\/p>/);
  assert.match(html, /width="600" height="900"/);
  assert.match(html, /loading="eager" fetchpriority="high"/);
  assert.match(html, /loading="lazy"/);
  const pictures = [...html.matchAll(/<picture>([\s\S]*?)<\/picture>/g)].map((match) => match[1]);
  assert.equal(pictures.length, 2);
  const sizesFor = (picture) => [...picture.matchAll(/ sizes="([^"]+)"/g)].map((match) => match[1]);
  const eagerSizes = sizesFor(pictures[0]);
  const lazySizes = sizesFor(pictures[1]);
  assert.equal(eagerSizes.length, 3, "AVIF, WebP and JPEG all declare sizes");
  assert.ok(eagerSizes.every((sizes) => sizes === eagerSizes[0] && !sizes.startsWith("auto")));
  assert.deepEqual(lazySizes, eagerSizes.map((sizes) => `auto, ${sizes}`));
  assert.match(eagerSizes[0], /min-width: 1100px/);
  assert.match(eagerSizes[0], /min-width: 640px/);
  assert.match(eagerSizes[0], /100vw$/);
  assert.match(pictures[0], /loading="eager" fetchpriority="high"/);
  assert.match(pictures[1], /loading="lazy"/);
  assert.doesNotMatch(pictures[1], /fetchpriority/);
  assert.doesNotMatch(overview, /sizes="auto/, "non-gallery pictures keep their existing sizing");
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
