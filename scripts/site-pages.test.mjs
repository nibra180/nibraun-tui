import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEGAL_ROUTES } from "./paths.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const projects = JSON.parse(read("photos.json")).projects;
const translations = JSON.parse(read("translations.json"));
const legal = JSON.parse(read("legal.json"));

for (const prefix of ["", "de/"]) {
  test(`${prefix || "en/"}home, work and photos have localized navigation and distinct content`, () => {
    const home = read(`${prefix}index.html`);
    const work = read(`${prefix}work/index.html`);
    const photos = read(`${prefix}photos/index.html`);
    const galleries = projects.map((project) => read(`${prefix}photos/${project.slug}/index.html`));
    for (const gallery of galleries) {
      assert.equal(gallery.split(`class="gallery-back" href="/${prefix}photos/"`).length - 1, 2);
    }
    for (const html of [home, work, photos, ...galleries]) {
      const footer = html.match(/<footer class="site-footer"[\s\S]*?<\/footer>/)[0];
      for (const routes of Object.values(LEGAL_ROUTES)) {
        assert.ok(footer.includes(`href="${routes[prefix ? 'de' : 'en']}"`));
      }
      const nav = html.match(/<nav class="site-nav"[\s\S]*?<\/nav>/)[0];
      assert.equal((nav.match(/<svg viewBox="0 0 24 24" aria-hidden="true">/g) ?? []).length, 3);
      assert.ok(nav.includes(`class="tone-purple" href="/${prefix}"`));
      assert.ok(nav.includes(`class="tone-blue" href="/${prefix}work/"`));
      assert.ok(nav.includes(`class="tone-green" href="/${prefix}photos/"`));
      for (const path of [`/${prefix}`, `/${prefix}work/`, `/${prefix}photos/`]) {
        assert.ok(nav.includes(`href="${path}"`), `Missing navigation link: ${path}`);
      }
      assert.doesNotMatch(html, /\{\{/);
      assert.doesNotMatch(html, /github-project-meta\.js|api\.github\.com|data-github-repo|id="repoStrings"/);
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
    assert.match(home, new RegExp(`class="home-card tone-blue" href="/${prefix}work/"`));
    assert.match(home, new RegExp(`class="home-card tone-green" href="/${prefix}photos/"`));
    assert.doesNotMatch(home, /class="home-art"/);
    assert.doesNotMatch(home, /id="projectList"|github-project-meta\.js/);
    assert.match(home, new RegExp(`href="/${prefix}" aria-current="page"`));
    assert.match(work, /id="projectList"/);
    assert.doesNotMatch(work, /class="photo-teaser"/);
    assert.doesNotMatch(work, /class="row-year"/);
    assert.match(work, /class="preview-panel/);
    assert.match(work, new RegExp(`href="/${prefix}work/" aria-current="page"`));
    assert.match(work, new RegExp(`rel="canonical" href="https://nibraun.de/${prefix}work/"`));
    assert.match(work, prefix === "" ? /href="\/de\/work\/" hreflang="de"/ : /href="\/work\/" hreflang="en"/);
    assert.equal((work.match(/<a[^>]+hreflang=/g) || []).length, 1);
    assert.match(photos, /class="photo-project tone-green"/);
  });
}

for (const locale of ["en", "de"]) {
  test(`${locale}legal pages contain confirmed operator and hosting information`, () => {
    for (const [page, routes] of Object.entries(LEGAL_ROUTES)) {
      const html = read(routes[locale].slice(1) + "index.html");
      assert.ok(html.includes(legal.operator.name));
      assert.ok(html.includes(legal.operator.street));
      assert.ok(html.includes(`${legal.operator.postalCode} ${legal.operator.city}`));
      assert.ok(html.includes(`href="mailto:${legal.operator.email}"`));
      assert.ok(html.includes(`rel="canonical" href="https://nibraun.de${routes[locale]}"`));
      const targetLocale = locale === "en" ? "de" : "en";
      assert.ok(html.includes(`href="${routes[targetLocale]}" hreflang="${targetLocale}"`));
      assert.equal((html.match(/<a[^>]+hreflang=/g) || []).length, 1);
      assert.doesNotMatch(html, /\{\{|\{%|api\.github\.com|github-project-meta\.js/);
      if (page === "privacy") {
        assert.ok(html.includes(legal.hosting.name));
        assert.ok(html.includes(legal.hosting.street));
        assert.ok(html.includes(legal.hosting.privacyUrl));
        assert.ok(html.includes('localStorage'));
        assert.ok(html.includes('galleryView'));
        assert.match(html, locale === "de" ? /nach 14 Tagen/ : /within 14 days/);
        assert.doesNotMatch(html, /netcup GmbH|log-policy/);
        assert.ok(html.includes("https://www.lfd.niedersachsen.de/"));
      }
    }
  });
}

test("sitemap includes legal pages and their language alternates", () => {
  const sitemap = read("sitemap.xml");
  for (const routes of Object.values(LEGAL_ROUTES)) {
    for (const [locale, path] of Object.entries(routes)) {
      assert.ok(sitemap.includes(`<loc>https://nibraun.de${path}</loc>`));
      assert.ok(sitemap.includes(`hreflang="${locale}" href="https://nibraun.de${path}"`));
    }
  }
});

test("sitemap includes both work pages", () => {
  const sitemap = read("sitemap.xml");
  assert.match(sitemap, /<loc>https:\/\/nibraun.de\/work\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/nibraun.de\/de\/work\/<\/loc>/);
});

for (const [locale, file] of [["en", "404.html"], ["de", "de/404.html"]]) {
  test(`${locale} not-found page is localized and kept out of the index`, () => {
    const html = read(file);
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.ok(html.includes(translations[locale]["notFound.title"]));
    assert.ok(html.includes(`href="${locale === "de" ? "/de/" : "/"}"`));
    assert.match(html, /<meta name="robots" content="noindex" \/>/);
    assert.doesNotMatch(html, /rel="canonical"|rel="alternate" hreflang/);
    assert.doesNotMatch(read("sitemap.xml"), /404/);
  });
}
