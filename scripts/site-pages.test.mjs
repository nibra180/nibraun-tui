import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const projects = JSON.parse(read("photos.json")).projects;
const translations = JSON.parse(read("translations.json"));

for (const prefix of ["", "de/"]) {
  test(`${prefix || "en/"}home, dev and photos have localized navigation and distinct content`, () => {
    const home = read(`${prefix}index.html`);
    const dev = read(`${prefix}dev/index.html`);
    const photos = read(`${prefix}photos/index.html`);
    const galleries = projects.map((project) => read(`${prefix}photos/${project.slug}/index.html`));
    for (const gallery of galleries) {
      assert.equal(gallery.split(`class="gallery-back" href="/${prefix}photos/"`).length - 1, 2);
    }
    for (const html of [home, dev, photos, ...galleries]) {
      const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0];
      assert.equal((nav.match(/<svg viewBox="0 0 24 24" aria-hidden="true">/g) ?? []).length, 3);
      assert.ok(nav.includes(`class="tone-purple" href="/${prefix}"`));
      assert.ok(nav.includes(`class="tone-blue" href="/${prefix}dev/"`));
      assert.ok(nav.includes(`class="tone-green" href="/${prefix}photos/"`));
      for (const path of [`/${prefix}`, `/${prefix}dev/`, `/${prefix}photos/`]) {
        assert.ok(nav.includes(`href="${path}"`), `Missing navigation link: ${path}`);
      }
      assert.doesNotMatch(html, /\{\{/);
    }
    assert.match(home, /class="home-photo"/);
    const heroPhotos = JSON.parse(home.match(/<script type="application\/json" id="homePhotos">([\s\S]*?)<\/script>/)[1]);
    assert.equal(heroPhotos.length, projects.reduce((count, project) => count + project.images.length, 0));
    for (const project of projects) {
      const galleryPhotos = heroPhotos.filter((photo) => photo.href === `/${prefix}photos/${project.slug}/`);
      assert.equal(galleryPhotos.length, project.images.length);
      for (const photo of galleryPhotos) {
        assert.equal(photo.caption, `${translations[prefix ? 'de' : 'en'][project.titleKey]}${project.year ? ` · ${project.year}` : ''}`);
      }
      assert.ok(photos.includes(`href="/${prefix}photos/${project.slug}/"`));
    }
    for (const photo of heroPhotos) {
      assert.match(photo.picture, /<picture>/);
      assert.match(photo.picture, /alt="[^"]+"/);
      assert.match(photo.picture, /fetchpriority="high"/);
    }
    assert.match(home, /<noscript><figure class="home-hero">/);
    assert.match(home, /class="home-photo-caption"/);
    assert.match(home, new RegExp(`class="home-card tone-blue" href="/${prefix}dev/"`));
    assert.match(home, new RegExp(`class="home-card tone-green" href="/${prefix}photos/"`));
    assert.doesNotMatch(home, /class="home-art"/);
    assert.doesNotMatch(home, /id="projectList"|github-project-meta\.js/);
    assert.match(home, new RegExp(`href="/${prefix}" aria-current="page"`));
    assert.match(dev, /id="projectList"/);
    assert.doesNotMatch(dev, /class="photo-teaser"/);
    assert.doesNotMatch(dev, /class="row-year"/);
    assert.match(dev, /class="preview-panel/);
    assert.match(dev, new RegExp(`href="/${prefix}dev/" aria-current="page"`));
    assert.match(dev, new RegExp(`rel="canonical" href="https://nibraun.de/${prefix}dev/"`));
    assert.match(dev, /href="\/dev\/" hreflang="en"/);
    assert.match(dev, /href="\/de\/dev\/" hreflang="de"/);
    assert.match(photos, /class="photo-project tone-green"/);
  });
}

test("sitemap includes both development pages", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /<loc>https:\/\/nibraun.de\/dev\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/nibraun.de\/de\/dev\/<\/loc>/);
});
