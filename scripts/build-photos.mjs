import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import sharp from "sharp";

const WIDTHS = [480, 800, 1200, 1800, 2560];
const FORMATS = { avif: { quality: 55 }, webp: { quality: 80 }, jpeg: { quality: 82, mozjpeg: true } };
// Below 640px both bleed to the viewport edges; see the Photography rules in src/tailwind.css.
const GALLERY_SIZES = "(min-width: 1100px) min(1072px, calc(100vw - 128px)), (min-width: 640px) 592px, 100vw";
const TEASER_SIZES = "(min-width: 1100px) min(1312px, calc(100vw - 128px)), (min-width: 640px) 592px, 100vw";

// Shared by the galleries and the homepage teaser, so both stay in sync.
export function photoPicture({ image, sizes, alt, escape, eager = false }) {
  const srcset = (variants) => variants.map(({ url, width }) => `${url} ${width}w`).join(", ");
  const fallback = image.variants.jpeg.find((item) => item.width >= 1200) ?? image.variants.jpeg.at(-1);
  return `<picture>
              <source type="image/avif" srcset="${srcset(image.variants.avif)}" sizes="${sizes}" />
              <source type="image/webp" srcset="${srcset(image.variants.webp)}" sizes="${sizes}" />
              <img src="${fallback.url}" srcset="${srcset(image.variants.jpeg)}" sizes="${sizes}" width="${image.width}" height="${image.height}" alt="${escape(alt)}" loading="${eager ? "eager" : "lazy"}"${eager ? ' fetchpriority="high"' : ""} decoding="async" />
            </picture>`;
}

export { GALLERY_SIZES, TEASER_SIZES };

export async function buildPhotos({ root, site, translations, translator, escape, write, year }) {
  const data = JSON.parse(readFileSync(join(root, "photos.json"), "utf8"));
  const template = readFileSync(join(root, "src/photos.html"), "utf8");
  const originals = resolve(root, "photo-originals");
  const slugs = new Set();
  const galleries = [];
  if (!Array.isArray(data.projects)) throw new Error("photos.json: projects must be an array");

  for (const project of data.projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug) || slugs.has(project.slug)) {
      throw new Error(`Invalid or duplicate photo project slug: ${project.slug}`);
    }
    slugs.add(project.slug);
    if (!Array.isArray(project.images) || !project.images.length) throw new Error(`No images for ${project.slug}`);
    for (const locale of Object.keys(translations)) {
      const t = translator(locale);
      t(project.titleKey);
      t(project.descriptionKey);
      for (const image of project.images) {
        t(image.altKey);
        if (image.captionKey) t(image.captionKey);
      }
    }
    const images = [];
    for (const image of project.images) {
      if (typeof image.file !== "string") throw new Error(`Missing image file in ${project.slug}`);
      const input = resolve(originals, image.file);
      if (!input.startsWith(originals + sep)) throw new Error(`Image outside photo-originals: ${image.file}`);
      const buffer = readFileSync(input);
      // Content and encoding settings form the URL, so published files can be cached immutably.
      const hash = createHash("sha256").update(buffer).update(JSON.stringify({ WIDTHS, FORMATS, sharp: sharp.versions })).digest("hex").slice(0, 20);
      const meta = await sharp(buffer).metadata();
      const rotated = [5, 6, 7, 8].includes(meta.orientation);
      const width = rotated ? meta.height : meta.width;
      const height = rotated ? meta.width : meta.height;
      if (!width || !height) throw new Error(`Missing dimensions: ${image.file}`);
      const widths = [...new Set(WIDTHS.map((size) => Math.min(size, width)))];
      const variants = {};
      const outputDir = join(root, "img/photos");
      mkdirSync(outputDir, { recursive: true });
      for (const [format, options] of Object.entries(FORMATS)) {
        variants[format] = [];
        for (const size of widths) {
          const filename = `${hash}-${size}.${format === "jpeg" ? "jpg" : format}`;
          const output = join(outputDir, filename);
          if (!existsSync(output)) {
            // autoOrient and default metadata stripping keep web copies upright and remove GPS/EXIF.
            await sharp(buffer).autoOrient().resize({ width: size, withoutEnlargement: true }).toFormat(format, options).toFile(output);
          }
          variants[format].push({ url: `/img/photos/${filename}`, width: size });
        }
      }
      images.push({ ...image, width, height, variants });
    }
    galleries.push({ ...project, images });
  }

  const pathFor = (locale, slug = "") => `${locale === "de" ? "/de" : ""}/photos/${slug ? `${slug}/` : ""}`;
  const groups = ["", ...galleries.map((project) => project.slug)].map((slug) => ({
    en: pathFor("en", slug), de: pathFor("de", slug),
  }));

  for (const locale of Object.keys(translations)) {
    const t = translator(locale);
    for (const project of [null, ...galleries]) {
      const paths = { en: pathFor("en", project?.slug), de: pathFor("de", project?.slug) };
      const heading = t(project ? project.titleKey : "photos.title");
      const description = t(project ? project.descriptionKey : "photos.description");
      const content = project
        ? `<p class="photos-description">${escape(description)}</p>\n<div class="photo-sequence">${project.images.map((image, index) => `<figure>
            ${photoPicture({ image, sizes: GALLERY_SIZES, alt: t(image.altKey), escape, eager: index === 0 })}${image.captionKey ? `<figcaption>${escape(t(image.captionKey))}</figcaption>` : ""}
          </figure>`).join("\n")}</div>`
        : galleries.length
          ? `<ul class="photo-projects">${galleries.map((item) => `<li><a href="${pathFor(locale, item.slug)}"><span>${escape(t(item.titleKey))}</span><span aria-hidden="true">→</span></a></li>`).join("\n")}</ul>`
          : `<p class="photos-description">${escape(t("photos.empty"))}</p>`;
      const values = {
        lang: locale, title: escape(`${heading} — Niklas Braun`), heading: escape(heading),
        description: escape(description), url: site + paths[locale],
        enUrl: site + paths.en, deUrl: site + paths.de, enPath: paths.en, dePath: paths.de,
        homePath: locale === "de" ? "/de/" : "/", year, content,
        enCurrent: locale === "en" ? ' aria-current="page"' : "",
        deCurrent: locale === "de" ? ' aria-current="page"' : "",
        backPath: project ? pathFor(locale) : locale === "de" ? "/de/" : "/",
        backLabel: escape(t(project ? "photos.back" : "nav.home")),
      };
      const html = template.replace(/\{\{(?:(t):([\w.]+)|(\w+))\}\}/g, (_, kind, key, name) => {
        if (kind) return escape(t(key));
        if (!(name in values)) throw new Error(`Unknown photo placeholder: ${name}`);
        return values[name];
      });
      write(paths[locale].slice(1) + "index.html", html);
    }
  }
  // The homepage teaser features the first project, so a new project takes over by its order alone.
  // Its image is the flagged one, else the first landscape shot, which suits the 3:2 teaser frame.
  const featured = galleries[0];
  const teaserImage = featured && (featured.images.find((image) => image.teaser)
    ?? featured.images.find((image) => image.width / image.height >= 1.2)
    ?? featured.images[0]);
  const teaser = featured
    ? { slug: featured.slug, titleKey: featured.titleKey, descriptionKey: featured.descriptionKey, image: teaserImage }
    : null;
  return { groups, teaser };
}
