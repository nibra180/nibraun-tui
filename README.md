# nibraun.de – Personal Portfolio

Personal website for Niklas Braun, with a Home teaser, a software portfolio under `/work/`, and photography under `/photos/` (German: `/de/`, `/de/work/`, `/de/photos/`). Home shows a large welcome heading, compact Work/Photos preview cards and a random photo with its gallery name and year; Work holds the previous portfolio. Text and hero enter once with a subtle stagger, respecting reduced motion.

## Design

The Work portfolio is "radically reduced": no dialogs, no carousel. On desktop it
reads top-down in three tiers on a 12-column grid. The intro comes first,
large and on its own. Below it sit the project index with name and type,
and a preview of whichever project the pointer or keyboard focus is on. The
bottom tier puts experience, stack, and contact side by side. On narrow screens
the first project becomes a card, the rest stay as list rows, and the preview
column goes away.

Two themes follow Monokai Pro: Light Sun and the dark default filter. The
first visit picks one from `prefers-color-scheme`, a switch in the header
overrides it, and `localStorage` keeps the choice. The six Monokai accents paint
the top bar, alternating stripes with a wavy lower edge. Each project takes the
next color in that order, and the active project shows it in three places only:
the row arrow, the cover word, and the link underline. Some accents only reach about 3:1, so they never color small text. Geist sets the text, Geist Mono the labels and dates.

Each project cover is a full-bleed color composition from `img/covers.svg`, a
sprite of one `<symbol>` per project. The compositions do not depict the
projects. Each is led by its project's tone, the other accents only set
counterweights. The page embeds them through `<use>`, so the theme tokens
reach the drawing and it switches with the theme. The desktop preview crops
the 400x300 canvas to 16:9, so the strip outside y 37.5 to 262.5 may be cut.

## Features

- Project index with hover and focus preview on desktop, featured card on mobile
- Static English and German Home, Work, photo index and gallery pages; old `?lang=de` links redirect
- Home teaser with a random photo and links to `/work/` and `/photos/` (German: `/de/work/` and `/de/photos/`)
- Photo index with thumbnail cards linking to individual galleries
- All content, JSON-LD (`ProfilePage`, `Person`, project list), `sitemap.xml`, `robots.txt` and `llms.txt` ship as static files, so crawlers without JavaScript see the full page
- Monokai Pro and Monokai Pro Light Sun themes, switchable and stored in `localStorage`
- Text selection with a tinted ground and a wavy underline; each new selection takes the next top-bar color, project rows keep their own
- Visible keyboard focus, 44 px touch targets on mobile, reduced-motion support
- Static deployment and vanilla JavaScript, no browser runtime dependencies; browser logic handles the theme, Home's random photo and Work previews

## Tech Stack

- Static Twig.js templates in `src/templates/`, rendered by `scripts/build-html.mjs` with Node; `twig` is an npm dev dependency
- `sharp` for build-time photo processing; no PHP or Twig runtime is deployed
- Tailwind CSS v4, with tokens and custom styles in `src/tailwind.css`
- Geist and Geist Mono, self-hosted in `fonts/` (SIL OFL 1.1)
- `translations.json` for German and English content
- `projects.json` for project links, order, and labels
- No automatic GitHub API requests or repository caches in the visitor's browser

## Development

```bash
npm install
npm run build     # CSS, localized HTML pages, photo variants, sitemap.xml and llms.txt
npm run dev       # CSS watch mode (first terminal)
npm run serve     # static server on http://localhost:8000 (second terminal)
```

`index.html`, `de/index.html`, `work/`, `de/work/`, `photos/`, `de/photos/`,
`imprint/`, `privacy/`, `de/impressum/`, `de/datenschutz/`, `sitemap.xml` and
`llms.txt` are generated, including the individual galleries.
Edit `src/templates/`, `translations.json` or the relevant data files and run
`npm run build:html` (or `npm run build`). Both builds use Node and `sharp`;
Twig.js renders HTML at build time only. The build stops with an error when a
translation key is missing in either language. Reload the browser after edits;
the static server does not inject live reload.
For a background CSS watcher without an interactive terminal, use
`npm run dev -- --watch=always`.

## Templates

`src/templates/layout.twig` defines the shared document structure. The page
templates `pages/{home,work,photos,gallery,legal}.twig` extend it and override blocks
for page-specific content, metadata and scripts. Includes reuse shared markup:

- `partials/{header,footer,theme-init,theme-controls}.twig` for shared page elements
- `components/{picture,cover,project-row,project-preview,photo-card}.twig` for images, project displays and photo index cards
- `partials/{theme-script,home-script,work-script}.twig` for browser logic, included in the rendered pages

Translations are exposed as `t(key)` with strict validation. Autoescaping is
enabled; only intentional footer HTML and serialized JSON use `raw`. Keep
ordinary text and data escaped. Neither templates nor the Twig.js runtime are
needed on the web server.

## Legal Pages

Legal notice and privacy policy are available at `/imprint/` and `/privacy/`,
with German versions at `/de/impressum/` and `/de/datenschutz/`. The shared footer
links to them on every page. `legal.json` holds operator and hosting details,
access-log retention and the review date; text remains in `translations.json`.
Update both when hosting or data processing changes, and rebuild. `legal.json`
is a build input and does not need to be deployed.

The operator confirmed netcup WCP/Plesk webhosting, access logs retained for at
most 14 days, disabled hosting visitor statistics and email hosting at netcup.
Fonts, images and scripts are self-hosted. Theme preference is the only browser
storage currently used; there are no automatic GitHub API requests or analytics.
Check the data processing agreement with netcup and obtain legal review before
publication; the templates do not guarantee legal compliance.

## Project Data

`projects.json` lists projects in display order. `year` and `repo` are
optional. `repo` distinguishes GitHub links from website links and supplies
repository information for structured data; no live metadata is requested. `kind` fills the type column and `stack` the preview. `art` names
the cover composition in `img/covers.svg`; without it the page shows the `cover`
word instead. `language` sets `programmingLanguage` in the JSON-LD.
`descriptionKey` points into `translations.json`.

`stack.json` holds the stack groups: `labelKey` points into
`translations.json`, `items` are technology names in display order. An item can
also be `{ "name", "noteKey" }`; the page then shows the name with the
translated note in parentheses. The build
also uses them for `knowsAbout` in the JSON-LD and for `llms.txt`. Both files are build inputs
only; the browser no longer loads them.

## Photography

`/photos/` (English) and `/de/photos/` (German) show thumbnail cards linking to
individual galleries. Home links to the photo index and uses a random photo as
its teaser; the portfolio footer also links to the index. Until projects are
added, the index shows a short empty-state message.

Add projects in display order to `photos.json`:

```json
{
  "projects": [
    {
      "slug": "winter-forest",
      "titleKey": "photos.winter.title",
      "descriptionKey": "photos.winter.description",
      "images": [
        {
          "file": "winter-forest/tree.jpg",
          "altKey": "photos.winter.tree.alt",
          "captionKey": "photos.winter.tree.caption"
        }
      ]
    }
  ]
}
```

Add each translation key to both languages in `translations.json`. `captionKey`
is optional; descriptive alt text is required. The optional gallery-level `year`
field supplies the year beneath Home's random hero photo. Place the original in
`photo-originals/winter-forest/tree.jpg`. This directory is gitignored and must
never be deployed. Keep a separate backup of the originals.

Run `npm run build`. `sharp` (a build-time dependency only) creates AVIF, WebP
and JPEG copies in `img/photos/`, at 480, 800, 1200, 1800 and 2560 px wide,
without enlarging smaller sources. It corrects EXIF orientation and removes
metadata, including GPS. URLs include a content/settings hash; unchanged
variants are reused on subsequent builds. Publish only the generated copies.
`img/photos/` is gitignored as well: build it locally before each deployment.

The build writes `/photos/winter-forest/` and `/de/photos/winter-forest/`, adds
them to the index and sitemap, and renders responsive `picture` elements with
intrinsic dimensions. Only the first photo loads eagerly; the others lazy-load.
No lightbox, originals, or full-gallery preload is shipped.

Configure the server to send `Cache-Control: public, max-age=31536000, immutable`
for `/img/photos/`; HTML should revalidate instead. Removed projects and old
image variants are not automatically deleted: remove their generated directories
from the deployment when retiring a series, but retain cached variants during
rollouts. `npm test` checks the index and image/gallery build using temporary
fixtures.

## Deployment

Run `npm run build`, then copy these files to the web server root. The pages
use root-relative paths, so the site must live at the domain root.

- `index.html`
- `work/`
- `de/` (including Work, Photos, legal notice and privacy policy)
- `imprint/`
- `privacy/`
- `photos/` (including generated galleries)
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `dist/tailwind.css`
- `fonts/`
- `img/`

## Links

- **Live**: [nibraun.de](https://nibraun.de)
- **GitHub**: [github.com/nibra180](https://github.com/nibra180)
- **WariKoda**: [github.com/WariKoda](https://github.com/WariKoda)
- **Instagram**: [instagram.com/nibraun_](https://www.instagram.com/nibraun_/)
- **Employer**: [Sharpness Solutions GmbH](https://sharpness.de)

## License

This repository is publicly visible, but it is not licensed for free use, reproduction, modification, or redistribution.

All rights reserved.
