import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Twig from "twig";
import { legalPaths } from "./paths.mjs";

const templateRoot = join(dirname(fileURLToPath(import.meta.url)), "../src/templates");

export const scriptJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

export function renderTemplate(name, context) {
  try {
    const template = Twig.twig({
      path: join(templateRoot, name),
      async: false,
      autoescape: true,
      strict_variables: true,
      rethrow: true,
    });
    return String(template.render({
      ogType: "website", ogTitle: context.title, ogDescription: context.description,
      ogImage: false, ogLocale: null, ogLocaleAlternate: null,
      pageClass: "", legacyPath: null, jsonLd: null,
      footerWarikoda: false, backPath: null,
      ...legalPaths(context.lang ?? "en"),
      ...context,
    }));
  } catch (error) {
    throw new Error(`Failed to render ${name}: ${error.message}`, { cause: error });
  }
}

export function pictureData(image, { sizes, alt, eager = false }) {
  const srcset = (variants) => variants.map(({ url, width }) => `${url} ${width}w`).join(", ");
  const fallback = image.variants.jpeg.find((item) => item.width >= 1200) ?? image.variants.jpeg.at(-1);
  return {
    src: fallback.url,
    avif: srcset(image.variants.avif),
    webp: srcset(image.variants.webp),
    jpeg: srcset(image.variants.jpeg),
    width: image.width,
    height: image.height,
    sizes, alt, eager,
  };
}
