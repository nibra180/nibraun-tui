// Renders src/index.html into index.html (en) and de/index.html (de), and
// writes sitemap.xml and llms.txt. Everything crawlers need ends up in the
// static HTML; the browser script only adds hover previews, theme and live
// GitHub data. Run with `node scripts/build-html.mjs` (part of npm run build).
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPhotos, photoPicture, TEASER_SIZES } from "./build-photos.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => readFileSync(join(root, file), "utf8");
const write = (file, content) => {
  mkdirSync(dirname(join(root, file)), { recursive: true });
  writeFileSync(join(root, file), content);
  console.log(`wrote ${file}`);
};

const SITE = "https://nibraun.de";
const LOCALES = {
  en: { path: "/", file: "index.html", ogLocale: "en_US" },
  de: { path: "/de/", file: "de/index.html", ogLocale: "de_DE" },
};
// Same order as the top bar; each project takes the next one.
const TONES = ["red", "orange", "yellow", "green", "blue", "purple"];
const PERSON_ID = `${SITE}/#person`;

const template = read("src/index.html");
const translations = JSON.parse(read("translations.json"));
const projects = JSON.parse(read("projects.json"));
const stack = JSON.parse(read("stack.json"));
const year = String(new Date().getFullYear());

const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);
// JSON inside <script> must not be able to close the element.
const scriptJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function translator(locale) {
  return (key) => {
    const value = translations[locale]?.[key];
    if (typeof value !== "string" || value === "") {
      throw new Error(`Missing translation "${key}" for locale "${locale}"`);
    }
    return value;
  };
}

function cover(project) {
  const art = project.art
    ? `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><use href="/img/covers.svg#${escape(project.art)}" width="400" height="300"/></svg>`
    : escape(project.cover || project.name);
  return `<span class="cover" aria-hidden="true">${art}</span>`;
}

const tone = (index) => `tone-${TONES[index % TONES.length]}`;

// On narrow screens the active row opens into a card; every row carries its cover and description for that.
function projectRows(t) {
  return projects.map((project, index) => `
            <li>
              <a class="project-row ${tone(index)}${index === 0 ? " is-active" : ""}" href="${escape(project.href)}" target="_blank" rel="noopener noreferrer">
                ${cover(project)}
                <span class="row-year">${escape(project.year)}</span>
                <span class="row-name">${escape(project.name)}</span>
                <span class="row-kind">${escape(project.kind)}</span>
                <svg class="row-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>
                <span class="row-desc">${escape(t(project.descriptionKey))}</span>
              </a>
            </li>`).join("");
}

// One panel per project, all in the HTML so every description is crawlable.
function projectPreviews(t) {
  return projects.map((project, index) => {
    const repo = project.repo
      ? `
            <div class="repo-meta mono" data-github-repo="${escape(project.repo)}"><span data-repo-release data-repo-release-state="loading">${escape(t("repo.release"))}: ${escape(t("repo.releaseLoading"))}</span><span data-repo-update data-repo-update-state="loading">${escape(t("repo.update"))}: ${escape(t("repo.updateLoading"))}</span></div>`
      : "";
    return `
          <div class="preview-panel ${tone(index)}${index === 0 ? "" : " is-inactive"}">
            ${cover(project)}
            <h3 class="preview-title"><span>${escape(project.name)}</span><span class="mono">${escape(project.year)}</span></h3>
            <p class="preview-desc">${escape(t(project.descriptionKey))}</p>
            <span class="mono">${escape(project.stack)}</span>${repo}
            <a class="preview-link" href="${escape(project.href)}" target="_blank" rel="noopener noreferrer">${escape(t(project.repo ? "work.openOn" : "work.openWebsite"))} <span aria-hidden="true">↗</span></a>
          </div>`;
  }).join("");
}

// A stack item is a plain name or { name, noteKey } with a translated note in parentheses.
const itemName = (item) => (typeof item === "string" ? item : item.name);
const itemLabel = (item, t) => (typeof item === "string" ? item : `${item.name} (${t(item.noteKey)})`);
// An item never breaks inside itself ("Claude Code", "Drift (SQLite)"); lines wrap after the commas.
const nowrapItem = (label) => escape(label).replaceAll(" ", "&nbsp;");

function stackGroups(t) {
  return stack.map((group) => `
            <dt>${escape(t(group.labelKey))}</dt><dd>${group.items.map((item) => nowrapItem(itemLabel(item, t))).join(", ")}</dd>`).join("");
}

function jsonLd(locale, t) {
  const url = SITE + LOCALES[locale].path;
  const works = projects.map((project, index) => {
    const item = project.repo
      ? {
        "@type": "SoftwareSourceCode",
        codeRepository: project.href,
        ...(project.language ? { programmingLanguage: project.language } : {}),
      }
      : { "@type": "SoftwareApplication" };
    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        ...item,
        name: project.name,
        description: t(project.descriptionKey),
        url: project.href,
        ...(project.year ? { dateCreated: project.year } : {}),
        author: { "@id": PERSON_ID },
      },
    };
  });
  return scriptJson({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${url}#page`,
        url,
        name: t("meta.title"),
        description: t("meta.description"),
        inLanguage: locale,
        mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: "Niklas Braun",
        url: `${SITE}/`,
        jobTitle: t("path.role1"),
        description: t("intro.lead"),
        worksFor: { "@type": "Organization", name: "Sharpness Solutions GmbH", url: "https://sharpness.de" },
        memberOf: { "@type": "Organization", name: "WariKoda", url: "https://github.com/WariKoda" },
        address: { "@type": "PostalAddress", addressLocality: "Oldenburg", addressRegion: "Niedersachsen", addressCountry: "DE" },
        knowsAbout: stack.flatMap((group) => group.items.map(itemName)),
        sameAs: ["https://github.com/nibra180", "https://www.instagram.com/nibraun_/"],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#projects`,
        name: t("work.title"),
        itemListElement: works,
      },
    ],
  });
}

// Old links used ?lang=de on the English page; send them to the German page.
const LEGACY_REDIRECT = `
    <script>
      if (new URLSearchParams(location.search).get("lang") === "de") location.replace("/de/");
    </script>`;

// Prominent entry to the photography section; empty when no photo project exists yet.
function photoTeaser(teaser, locale, t) {
  if (!teaser) return "";
  const alt = t(teaser.image.altKey);
  const picture = photoPicture({ image: teaser.image, sizes: TEASER_SIZES, alt, escape });
  return `        <!-- ==================== PHOTOGRAPHY ==================== -->
        <section class="photo-teaser" aria-labelledby="photoTeaserTitle">
          <h2 class="label photo-teaser-label" id="photoTeaserTitle">${escape(t("photos.title"))}</h2>
          <a class="photo-teaser-link" href="${locale === "de" ? "/de" : ""}/photos/${teaser.slug}/">
            ${picture}
            <span class="photo-teaser-head">
              <span class="photo-teaser-name">${escape(t(teaser.titleKey))}</span>
              <span class="photo-teaser-arrow" aria-hidden="true">→</span>
            </span>
          </a>
          <p class="photo-teaser-desc">${escape(t(teaser.descriptionKey))}</p>
        </section>`;
}

function renderPage(locale, teaser) {
  const t = translator(locale);
  const other = locale === "en" ? "de" : "en";
  const values = {
    lang: locale,
    url: SITE + LOCALES[locale].path,
    homePath: LOCALES[locale].path,
    photosPath: locale === "de" ? "/de/photos/" : "/photos/",
    ogLocale: LOCALES[locale].ogLocale,
    ogLocaleAlternate: LOCALES[other].ogLocale,
    enCurrent: locale === "en" ? ' aria-current="page"' : "",
    deCurrent: locale === "de" ? ' aria-current="page"' : "",
    legacyRedirect: locale === "en" ? LEGACY_REDIRECT : "",
    jsonLd: jsonLd(locale, t),
    repoStrings: scriptJson(Object.fromEntries(Object.keys(translations[locale])
      .filter((key) => key.startsWith("repo.")).map((key) => [key, t(key)]))),
    projectRows: projectRows(t),
    projectPreviews: projectPreviews(t),
    photoTeaser: photoTeaser(teaser, locale, t),
    stackGroups: stackGroups(t),
    year,
  };
  const html = template
    .replace(/<!--\s*Template for[\s\S]*?-->/, "<!-- Generated from src/index.html by scripts/build-html.mjs. Do not edit. -->")
    // One pass, so text that was just inserted is never scanned for placeholders again.
    .replace(/\{\{(?:(t|html):([\w.]+)|(\w+))\}\}/g, (_, kind, key, name) => {
      if (kind) return kind === "t" ? escape(t(key)) : t(key);
      if (!(name in values)) throw new Error(`Unknown placeholder {{${name}}}`);
      return values[name];
    });
  write(LOCALES[locale].file, html);
}

function renderSitemap(photoGroups) {
  const groups = [{ en: "/", de: "/de/" }, ...photoGroups];
  const urls = groups.flatMap((group) => {
    const alternates = Object.entries(group)
      .map(([locale, path]) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE}${path}"/>`)
      .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}${group.en}"/>`)
      .join("\n");
    return Object.values(group).map((path) => `  <url>\n    <loc>${SITE}${path}</loc>\n${alternates}\n  </url>`);
  }).join("\n");
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`);
}

// A plain-text summary for language models, following the llms.txt proposal.
function renderLlmsTxt() {
  const t = translator("en");
  const list = projects.map((project) => `- [${project.name}](${project.href}): ${t(project.descriptionKey)} Stack: ${project.stack}.`).join("\n");
  write("llms.txt", `# Niklas Braun

> ${t("intro.lead")} Based in Oldenburg, Germany.

German version: ${SITE}/de/

## Projects

${list}

## Stack

${stack.map((group) => `- ${t(group.labelKey)}: ${group.items.map((item) => itemLabel(item, t)).join(", ")}`).join("\n")}

## Experience

- 2025 to now: ${t("path.role1")}, Sharpness Solutions
- 2021 to 2025: ${t("path.role2")}, WL Online
- 2018 to 2021: ${t("path.role3")}, WL Online

## Links

- [Business enquiries via Sharpness Solutions](https://www.sharpness.de/kontakt)
- [GitHub](https://github.com/nibra180)
- [WariKoda, open source with @bdgraue](https://github.com/WariKoda)
- [Instagram](https://www.instagram.com/nibraun_/)
`);
}

const { groups: photoGroups, teaser } = await buildPhotos({ root, site: SITE, translations, translator, escape, write, year });
for (const locale of Object.keys(LOCALES)) renderPage(locale, teaser);
renderSitemap(photoGroups);
renderLlmsTxt();
