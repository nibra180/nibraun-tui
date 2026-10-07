import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import { pictureData, renderTemplate, scriptJson } from "./templates.mjs";
import { LEGAL_ROUTES } from "./paths.mjs";

const translations = JSON.parse(readFileSync(new URL("../translations.json", import.meta.url), "utf8"));
const t = (key) => {
  if (!translations.en[key]) throw new Error(`Missing translation: ${key}`);
  return translations.en[key];
};
const context = {
  t, lang: "en", activePage: "photos", title: "Photography", heading: "Photography",
  description: "Photo projects", url: "https://example.com/photos/",
  enUrl: "https://example.com/photos/", deUrl: "https://example.com/de/photos/",
  enPath: "/photos/", dePath: "/de/photos/", homePath: "/", workPath: "/work/", photosPath: "/photos/",
  mainId: "photos", skipLabel: "Skip to photos", year: "2026", galleries: [],
};
const image = {
  width: 1200, height: 800,
  variants: Object.fromEntries(["avif", "webp", "jpeg"].map((format) => [format, [
    { width: 480, url: `/img/test-480.${format}` },
    { width: 1200, url: `/img/test-1200.${format}` },
  ]])),
};

test("Twig inheritance and shared includes produce the page layout", () => {
  const html = renderTemplate("pages/photos.twig", context);
  assert.equal((html.match(/class="site-header"/g) ?? []).length, 1);
  assert.equal((html.match(/class="site-footer"/g) ?? []).length, 1);
  assert.equal((html.match(/function applyTheme/g) ?? []).length, 1);
  assert.doesNotMatch(html, /updateHeaderControls|is-away-from-top/);
  assert.match(html, /href="\/photos\/" aria-current="page"/);
  assert.match(html, /My photography projects will appear here soon\./);
  assert.doesNotMatch(html, /\{%|\{\{/);
});

test("the lightbox reuses theme controls immediately before the close button", () => {
  const html = renderTemplate("partials/lightbox.twig", { t });
  const header = html.match(/<div class="lightbox-header">([\s\S]*?)<\/div>\s*<div class="lightbox-stage">/)[1];
  assert.match(header, /class="switch theme-switch"/);
  assert.equal((header.match(/data-theme-choice=/g) ?? []).length, 2);
  assert.ok(header.indexOf('class="switch theme-switch"') < header.indexOf('class="lightbox-close"'));
});

test("the lightbox visibly explains backdrop dismissal in both languages", () => {
  for (const locale of ["en", "de"]) {
    const html = renderTemplate("partials/lightbox.twig", { t: (key) => translations[locale][key] });
    assert.match(html, /aria-describedby="lightbox-dismiss-hint"/);
    const hint = html.match(/<p class="lightbox-hint" id="lightbox-dismiss-hint">([^<]+)<\/p>/)[1];
    assert.equal(hint, translations[locale]["photos.lightbox.dismissHint"]);
  }
});

test("theme switches stay synchronized, persist the preference and retain focus", () => {
  const root = { dataset: { theme: "light" } };
  const stored = {};
  let focused;
  const groups = Array.from({ length: 3 }, () => {
    const buttons = ["light", "dark"].map((theme) => ({
      dataset: { themeChoice: theme }, attributes: {},
      setAttribute(name, value) { this.attributes[name] = value; },
      addEventListener(type, listener) { this.click = listener; },
      focus(options) { focused = { button: this, options }; },
    }));
    const group = { querySelector: () => buttons.find((button) => button.attributes["aria-pressed"] === "true") };
    for (const button of buttons) button.closest = () => group;
    return buttons;
  });
  const meta = { setAttribute() {} };
  const themeScript = new Script(readFileSync(new URL("../src/templates/partials/theme-script.twig", import.meta.url), "utf8"));
  themeScript.runInNewContext({
    document: { documentElement: root, querySelectorAll: () => groups.flat(), querySelector: () => meta },
    getComputedStyle: () => ({ getPropertyValue: () => "background" }),
    localStorage: { setItem: (key, value) => { stored[key] = value; } },
  });
  assert.equal(stored.theme, undefined, "initialization does not store a preference");
  groups[2][0].click();
  assert.equal(root.dataset.theme, "dark");
  assert.equal(stored.theme, "dark");
  assert.ok(groups.every(([light, dark]) => light.attributes["aria-pressed"] === "false" && dark.attributes["aria-pressed"] === "true"));
  assert.equal(focused.button, groups[2][1]);
  assert.equal(focused.options.preventScroll, true);
  groups[2][1].click();
  assert.equal(root.dataset.theme, "light");
  assert.equal(stored.theme, "light");
  assert.equal(focused.button, groups[2][0]);
});

test("Twig autoescapes text and attributes without double escaping", () => {
  const malicious = '<script>alert("x")</script> & snow';
  const html = renderTemplate("pages/photos.twig", { ...context, title: malicious, heading: malicious });
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; snow/);
  assert.doesNotMatch(html, /<script>alert/);
  assert.doesNotMatch(html, /&amp;lt;/);
  const picture = pictureData(image, { sizes: "360px", alt: malicious });
  const output = renderTemplate("components/picture.twig", { picture });
  assert.match(output, /alt="&lt;script&gt;/);
  assert.match(output, /loading="lazy"/);
  assert.doesNotMatch(output, /fetchpriority/);
});

test("missing required variables and translations fail the build", () => {
  const { heading, ...missingHeading } = context;
  assert.throws(() => renderTemplate("pages/photos.twig", missingHeading), /heading/);
  assert.throws(() => renderTemplate("pages/photos.twig", {
    ...context, t: (key) => { throw new Error(`Missing translation: ${key}`); },
  }), /Missing translation/);
});

test("script JSON stays parseable and cannot close its script element", () => {
  const data = [{ text: '</script><script>alert("x")</script>' }];
  const serialized = scriptJson(data);
  assert.doesNotMatch(serialized, /<\/script>/);
  assert.deepEqual(JSON.parse(serialized), data);
  const html = renderTemplate("pages/home.twig", {
    ...context, activePage: "home", homePhotos: serialized,
    homeProject: null, homeThumbnail: null,
  });
  const emitted = html.match(/id="homePhotos">([\s\S]*?)<\/script>/)[1];
  assert.deepEqual(JSON.parse(emitted), data);
});

test("the Home photo tile shows one randomly selected gallery lead image", () => {
  const photos = [{ picture: "<picture>mountain</picture>" }, { picture: "<picture>forest</picture>" }];
  const thumbnail = { innerHTML: "fallback" };
  const document = {
    querySelector: (selector) => selector === "[data-home-photo]" ? thumbnail : null,
    getElementById: () => ({ textContent: scriptJson(photos) }),
  };
  const math = Object.create(Math);
  math.random = () => 0.999;
  const script = new Script(readFileSync(new URL("../src/templates/partials/home-script.twig", import.meta.url), "utf8"));
  script.runInNewContext({ document, Math: math });
  assert.equal(thumbnail.innerHTML, photos[1].picture);
  thumbnail.innerHTML = "placeholder";
  photos.length = 0;
  script.runInNewContext({ document, Math: math });
  assert.equal(thumbnail.innerHTML, "placeholder");
});

test("Home cards work without JavaScript and without galleries", () => {
  const picture = pictureData(image, { sizes: "252px", alt: "A mountain", eager: true });
  const values = { ...context, activePage: "home", homeProject: null, homeThumbnail: picture, homePhotos: "[]" };
  const html = renderTemplate("pages/home.twig", values);
  assert.match(html, /<noscript>\s*<picture>/);
  assert.match(html, /data-home-photo/);
  assert.equal((html.match(/class="home-card tone-/g) ?? []).length, 2);
  assert.doesNotMatch(html, /class="home-hero"|class="home-photo"/);
  const empty = renderTemplate("pages/home.twig", { ...values, homeThumbnail: null });
  assert.equal((empty.match(/class="home-card-placeholder"/g) ?? []).length, 2);
  assert.doesNotMatch(empty, /<picture>|<noscript>/);
});

test("all generated inline browser scripts are valid JavaScript", () => {
  const projects = JSON.parse(readFileSync(new URL("../photos.json", import.meta.url), "utf8")).projects;
  for (const prefix of ["", "de/"]) {
    const locale = prefix ? "de" : "en";
    const legalFiles = Object.values(LEGAL_ROUTES).map((routes) => routes[locale].slice(1 + prefix.length) + "index.html");
    const files = ["index.html", "work/index.html", "photos/index.html", ...legalFiles, ...projects.map((project) => `photos/${project.slug}/index.html`)];
    for (const file of files) {
      const html = readFileSync(new URL(`../${prefix}${file}`, import.meta.url), "utf8");
      for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/type="application\/(?:ld\+)?json"/.test(match[1])) JSON.parse(match[2]);
        else if (!/src=/.test(match[1])) assert.doesNotThrow(() => new Script(match[2], { filename: file }));
      }
    }
  }
});
