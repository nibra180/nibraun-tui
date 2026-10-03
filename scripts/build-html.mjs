// Builds static localized pages from Twig, plus sitemap.xml and llms.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildPhotos } from "./build-photos.mjs";
import { pictureData, renderTemplate, scriptJson } from "./templates.mjs";
import { LEGAL_ROUTES } from "./paths.mjs";

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
const TONES = ["red", "orange", "yellow", "green", "blue", "purple"];
const PERSON_ID = `${SITE}/#person`;
const HERO_SIZES = "(min-width: 1100px) min(560px, calc((100vw - 192px) * 560 / 1180)), (min-width: 608px) 560px, calc(100vw - 48px)";
const translations = JSON.parse(read("translations.json"));
const projects = JSON.parse(read("projects.json"));
const stack = JSON.parse(read("stack.json"));
const legal = JSON.parse(read("legal.json"));
const year = String(new Date().getFullYear());

function translator(locale) {
  return (key, replacements = {}) => {
    const value = translations[locale]?.[key];
    if (typeof value !== "string" || value === "") {
      throw new Error(`Missing translation "${key}" for locale "${locale}"`);
    }
    return value.replace(/\{(\w+)\}/g, (_, name) => {
      if (!Object.hasOwn(replacements, name)) throw new Error(`Missing replacement "${name}" for "${key}"`);
      return String(replacements[name]);
    });
  };
}

const itemName = (item) => typeof item === "string" ? item : item.name;
const itemLabel = (item, t) => typeof item === "string" ? item : `${item.name} (${t(item.noteKey)})`;

function jsonLd(locale, t, page) {
  const url = SITE + LOCALES[locale].path + (page === "work" ? "work/" : "");
  const works = projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      ...(project.repo ? {
        "@type": "SoftwareSourceCode",
        codeRepository: project.href,
        ...(project.language ? { programmingLanguage: project.language } : {}),
      } : { "@type": "SoftwareApplication" }),
      name: project.name,
      description: t(project.descriptionKey),
      url: project.href,
      ...(project.year ? { dateCreated: project.year } : {}),
      author: { "@id": PERSON_ID },
    },
  }));
  return scriptJson({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage", "@id": `${url}#page`, url,
        name: t(page === "home" ? "home.title" : "meta.title"),
        description: t(page === "home" ? "home.teaser" : "meta.description"),
        inLanguage: locale, mainEntity: { "@id": PERSON_ID },
      },
      {
        "@type": "Person", "@id": PERSON_ID, name: "Niklas Braun", url: `${SITE}/`,
        jobTitle: t("path.role1"), description: t("intro.lead"),
        worksFor: { "@type": "Organization", name: "Sharpness Solutions GmbH", url: "https://sharpness.de" },
        memberOf: { "@type": "Organization", name: "WariKoda", url: "https://github.com/WariKoda" },
        address: { "@type": "PostalAddress", addressLocality: "Oldenburg", addressRegion: "Niedersachsen", addressCountry: "DE" },
        knowsAbout: stack.flatMap((group) => group.items.map(itemName)),
        sameAs: ["https://github.com/nibra180", "https://www.instagram.com/nibraun_/"],
      },
      ...(page === "work" ? [{
        "@type": "ItemList", "@id": `${url}#projects`, name: t("work.title"), itemListElement: works,
      }] : []),
    ],
  });
}

function renderPage(locale, page, galleries) {
  const t = translator(locale);
  const other = locale === "en" ? "de" : "en";
  const suffix = page === "work" ? "work/" : "";
  const heroPhotos = page === "home" ? galleries.flatMap((gallery) => gallery.images.map((image) => ({
    href: `${LOCALES[locale].path}photos/${gallery.slug}/`,
    caption: `${t(gallery.titleKey)}${gallery.year ? ` · ${gallery.year}` : ""}`,
    picture: pictureData(image, { sizes: HERO_SIZES, alt: t(image.altKey), eager: true }),
  }))) : [];
  const featuredGallery = galleries[0];
  const featuredImage = featuredGallery && (featuredGallery.images.find((image) => image.teaser) ?? featuredGallery.images[0]);
  const values = {
    t, lang: locale, activePage: page,
    title: t(page === "home" ? "home.title" : "meta.title"),
    description: t(page === "home" ? "home.teaser" : "meta.description"),
    ogType: page === "work" ? "profile" : "website",
    ogTitle: t(page === "work" ? "meta.ogTitle" : "home.title"),
    ogDescription: t(page === "work" ? "meta.ogDescription" : "home.teaser"),
    ogImage: true,
    url: SITE + LOCALES[locale].path + suffix,
    enUrl: SITE + LOCALES.en.path + suffix,
    deUrl: SITE + LOCALES.de.path + suffix,
    enPath: LOCALES.en.path + suffix,
    dePath: LOCALES.de.path + suffix,
    homePath: LOCALES[locale].path,
    workPath: LOCALES[locale].path + "work/",
    photosPath: LOCALES[locale].path + "photos/",
    ogLocale: LOCALES[locale].ogLocale,
    ogLocaleAlternate: LOCALES[other].ogLocale,
    mainId: page === "home" ? "home" : "work",
    skipLabel: t(page === "home" ? "home.skip" : "nav.skip"),
    pageClass: page === "home" ? "home-page" : "",
    // Old ?lang=de links must preserve the current section.
    legacyPath: locale === "en" ? scriptJson(`/de/${suffix}`) : null,
    jsonLd: jsonLd(locale, t, page),
    heroFallback: heroPhotos[0] ?? null,
    homeProject: projects[0] ? { art: null, cover: null, ...projects[0] } : null,
    homeThumbnail: featuredImage ? pictureData(featuredImage, {
      sizes: "(min-width: 1100px) 282px, (min-width: 640px) 276px, calc((100vw - 64px) / 2 - 20px)",
      alt: t(featuredImage.altKey),
    }) : null,
    homePhotos: scriptJson(heroPhotos.map((photo) => ({
      href: photo.href, caption: photo.caption, picture: renderTemplate("components/picture.twig", { picture: photo.picture }),
    }))),
    projects: projects.map((project, index) => ({ art: null, cover: null, repo: null, year: null, ...project, tone: `tone-${TONES[index % TONES.length]}` })),
    // Non-breaking spaces keep each technology name together without raw HTML.
    stack: stack.map((group) => ({ ...group, labels: group.items.map((item) => itemLabel(item, t).replaceAll(" ", "\u00a0")) })),
    footerWarikoda: page === "work", year,
  };
  write(page === "work" ? `${LOCALES[locale].path.slice(1)}work/index.html` : LOCALES[locale].file,
    renderTemplate(`pages/${page}.twig`, values));
}

function renderLegalPage(locale, page) {
  const t = translator(locale);
  const routes = LEGAL_ROUTES[page];
  const sections = page === "privacy" ? [
    { key: "overview", paragraphs: ["text"] },
    { key: "hosting", paragraphs: ["intro", "logs", "purpose", "retention"], hosting: true },
    { key: "theme", paragraphs: ["storage", "purpose", "retention"] },
    { key: "contact", paragraphs: ["data", "basis", "retention"] },
    { key: "links", paragraphs: ["local", "external"] },
    { key: "rights", paragraphs: ["general", "objection", "complaint"], authority: true },
    { key: "provision", paragraphs: ["text"] },
  ].map((section) => ({
    heading: t(`privacy.${section.key}.heading`),
    hosting: section.hosting ?? false,
    authority: section.authority ?? false,
    paragraphs: section.paragraphs.map((key) => t(`privacy.${section.key}.${key}`, { days: legal.hosting.logRetentionDays })),
  })) : [];
  const values = {
    t, legal, sections, lang: locale, activePage: page, year,
    heading: t(`${page}.title`), title: `${t(`${page}.title`)} — ${legal.operator.name}`,
    description: t(`${page}.description`),
    url: SITE + routes[locale], enUrl: SITE + routes.en, deUrl: SITE + routes.de,
    enPath: routes.en, dePath: routes.de,
    homePath: LOCALES[locale].path, workPath: LOCALES[locale].path + "work/",
    photosPath: LOCALES[locale].path + "photos/",
    mainId: "legal", skipLabel: t("home.skip"), pageClass: "legal-page",
    updatedAt: new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(new Date(legal.updatedAt)),
    authorityUrl: "https://www.lfd.niedersachsen.de/",
  };
  write(routes[locale].slice(1) + "index.html", renderTemplate("pages/legal.twig", values));
}

function renderSitemap(photoGroups) {
  const groups = [{ en: "/", de: "/de/" }, { en: "/work/", de: "/de/work/" }, ...Object.values(LEGAL_ROUTES), ...photoGroups];
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

function renderLlmsTxt() {
  const t = translator("en");
  const list = projects.map((project) => `- [${project.name}](${project.href}): ${t(project.descriptionKey)} Stack: ${project.stack}.`).join("\n");
  write("llms.txt", `# Niklas Braun

> ${t("home.teaser")}

German version: ${SITE}/de/
Work portfolio: ${SITE}/work/
Photography: ${SITE}/photos/

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

const { groups: photoGroups, galleries } = await buildPhotos({ root, site: SITE, translations, translator, write, year });
for (const locale of Object.keys(LOCALES)) {
  renderPage(locale, "home", galleries);
  renderPage(locale, "work", galleries);
  for (const page of Object.keys(LEGAL_ROUTES)) renderLegalPage(locale, page);
}
renderSitemap(photoGroups);
renderLlmsTxt();
