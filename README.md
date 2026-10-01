# nibraun.de – Personal Portfolio

Personal portfolio website for Niklas Braun, built as a showcase for published software.

## Design

"Radically reduced": one page, no dialogs, no carousel. On desktop the page
reads top-down in three tiers on a 12-column grid. The intro comes first,
large and on its own. Below it sit the project index with year, name, and type,
and a preview of whichever project the pointer or keyboard focus is on. The
bottom tier puts experience, stack, and contact side by side. On narrow screens
the first project becomes a card, the rest stay as list rows, and the preview
column goes away.

Two themes follow Monokai Pro: Light Sun and the dark default filter. The
first visit picks one from `prefers-color-scheme`, a switch in the header
overrides it, and `localStorage` keeps the choice. The six Monokai accents paint
the top bar, alternating stripes with a wavy lower edge. Each project takes the
next color in that order, and the active project shows it in three places only:
the row arrow, the cover word, and the link underline. Green also marks live
GitHub data. Some accents only reach about 3:1, so they never color small text. Geist sets the text, Geist Mono the labels and dates.

Each project cover is a full-bleed color composition from `img/covers.svg`, a
sprite of one `<symbol>` per project. The compositions do not depict the
projects. Each is led by its project's tone, the other accents only set
counterweights. The page embeds them through `<use>`, so the theme tokens
reach the drawing and it switches with the theme. The desktop preview crops
the 400x300 canvas to 16:9, so the strip outside y 37.5 to 262.5 may be cut.

## Features

- Project index with hover and focus preview on desktop, featured card on mobile
- Live GitHub release and last push in the preview, cached for six hours
- Static English and German pages at `/` and `/de/`; old `?lang=de` links redirect
- All content, JSON-LD (`ProfilePage`, `Person`, project list), `sitemap.xml`, `robots.txt` and `llms.txt` ship as static files, so crawlers without JavaScript see the full page
- Monokai Pro and Monokai Pro Light Sun themes, switchable and stored in `localStorage`
- Text selection with a tinted ground and a wavy underline; each new selection takes the next top-bar color, project rows keep their own
- Visible keyboard focus, 44 px touch targets on mobile, reduced-motion support
- Static deployment and vanilla JavaScript, no browser runtime dependencies; the browser script only swaps previews, sets the theme and loads GitHub data

## Tech Stack

- `src/index.html` as the page template, rendered by `scripts/build-html.mjs` (Node, no dependencies)
- Tailwind CSS v4, with tokens and custom styles in `src/tailwind.css`
- Geist and Geist Mono, self-hosted in `fonts/` (SIL OFL 1.1)
- `translations.json` for German and English content
- `projects.json` for project links, order, and labels
- `github-project-meta.js` for GitHub release and update metadata

## Development

```bash
npm install
npm run build     # CSS, both HTML pages, sitemap.xml and llms.txt
npm run dev       # CSS watch mode (first terminal)
npm run serve     # static server on http://localhost:8000 (second terminal)
```

`index.html`, `de/index.html`, `sitemap.xml` and `llms.txt` are generated.
Edit `src/index.html`, `translations.json` or `projects.json` and run
`npm run build:html` (or `npm run build`). The build stops with an error when a
translation key is missing in either language. Reload the browser after edits;
the static server does not inject live reload.
For a background CSS watcher without an interactive terminal, use
`npm run dev -- --watch=always`.

## Project Data

`projects.json` lists projects in display order. `year` and `repo` are
optional. Without `repo` the preview links to `href` as a website and skips the
GitHub data. `kind` fills the type column and `stack` the preview. `art` names
the cover composition in `img/covers.svg`; without it the page shows the `cover`
word instead. `language` sets `programmingLanguage` in the JSON-LD.
`descriptionKey` points into `translations.json`.

`stack.json` holds the stack groups: `labelKey` points into
`translations.json`, `items` are technology names in display order. An item can
also be `{ "name", "noteKey" }`; the page then shows the name with the
translated note in parentheses. The build
also uses them for `knowsAbout` in the JSON-LD and for `llms.txt`. Both files are build inputs
only; the browser no longer loads them.

## Deployment

Run `npm run build`, then copy these files to the web server root. The pages
use root-relative paths, so the site must live at the domain root.

- `index.html`
- `de/`
- `robots.txt`
- `sitemap.xml`
- `llms.txt`
- `github-project-meta.js`
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
