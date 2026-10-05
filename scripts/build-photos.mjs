import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import sharp from "sharp";
import { pictureData, renderTemplate } from "./templates.mjs";

const WIDTHS = [480, 800, 1200, 1800, 2560];
const FORMATS = { avif: { quality: 55 }, webp: { quality: 80 }, jpeg: { quality: 82, mozjpeg: true } };
// Below 640px gallery photos bleed to the viewport edges.
const GALLERY_SIZES = "(min-width: 1100px) min(1312px, calc(100vw - 128px)), (min-width: 640px) 592px, 100vw";
// Lazy images use their laid-out width in either view; older browsers keep the responsive fallback.
const GALLERY_LAZY_SIZES = `auto, ${GALLERY_SIZES}`;
const CARD_SIZES = "(min-width: 640px) 388px, calc(100vw - 60px)";
const TONES = ["green", "blue", "purple", "orange", "yellow", "red"];

export async function buildPhotos({ root, site, translations, translator, write, year }) {
  const data = JSON.parse(readFileSync(join(root, "photos.json"), "utf8"));
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
    const teasers = project.images.filter((image) => image.teaser === true);
    if (teasers.length > 1) throw new Error(`Multiple teaser images for ${project.slug}`);
    const teaser = teasers[0] ?? project.images[0];
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
    // One lead image drives the gallery order, index thumbnail and Home selection.
    for (const image of [teaser, ...project.images.filter((image) => image !== teaser)]) {
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
      const values = {
        t, lang: locale, title: `${heading} — Niklas Braun`, heading,
        description, url: site + paths[locale],
        enUrl: site + paths.en, deUrl: site + paths.de, enPath: paths.en, dePath: paths.de,
        homePath: locale === "de" ? "/de/" : "/", year,
        photosPath: pathFor(locale),
        workPath: locale === "de" ? "/de/work/" : "/work/",
        activePage: project ? "gallery" : "photos",
        mainId: "photos", skipLabel: t("photos.skip"), pageClass: "photos-page",
        backPath: project ? pathFor(locale) : locale === "de" ? "/de/" : "/",
        backLabel: t(project ? "photos.back" : "nav.home"),
        images: project ? project.images.map((image, index) => ({
          captionKey: null, ...image, picture: pictureData(image, { sizes: index === 0 ? GALLERY_SIZES : GALLERY_LAZY_SIZES, alt: t(image.altKey), eager: index === 0 }),
        })) : [],
        galleries: galleries.map((gallery, index) => {
          const image = gallery.images[0];
          return {
            ...gallery, href: pathFor(locale, gallery.slug), tone: `tone-${TONES[index % TONES.length]}`,
            picture: pictureData(image, { sizes: CARD_SIZES, alt: t(image.altKey), eager: index === 0 }),
          };
        }),
      };
      const html = renderTemplate(`pages/${project ? "gallery" : "photos"}.twig`, values);
      write(paths[locale].slice(1) + "index.html", html);
    }
  }
  return { groups, galleries };
}
