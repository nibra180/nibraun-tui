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

The project covers are typographic placeholders, not screenshots.

## Features

- Project index with hover and focus preview on desktop, featured card on mobile
- Live GitHub release and last push in the preview, cached for six hours
- DE/EN translations with `?lang=` and `localStorage`
- Monokai Pro and Monokai Pro Light Sun themes, switchable and stored in `localStorage`
- Text selection with a tinted ground and a wavy underline; each new selection takes the next top-bar color, project rows keep their own
- Visible keyboard focus, 44 px touch targets on mobile, reduced-motion support
- Static deployment and vanilla JavaScript, no browser runtime dependencies

## Tech Stack

- HTML5 and vanilla JavaScript in `index.html`
- Tailwind CSS v4, with tokens and custom styles in `src/tailwind.css`
- Geist and Geist Mono, self-hosted in `fonts/` (SIL OFL 1.1)
- `translations.json` for German and English content
- `projects.json` for project links, order, and labels
- `github-project-meta.js` for GitHub release and update metadata

## Development

```bash
npm install
npm run build     # one-off minified CSS build
npm run dev       # CSS watch mode (first terminal)
npm run serve     # static server on http://localhost:8000 (second terminal)
```

Reload the browser after edits. The static server does not inject live reload.
For a background CSS watcher without an interactive terminal, use
`npm run dev -- --watch=always`.

## Project Data

`projects.json` lists projects in display order. `year` and `repo` are
optional. Without `repo` the preview links to `href` as a website and skips the
GitHub data. `kind` fills the type column, `stack` the preview, and `cover` is
the word on the placeholder cover. `descriptionKey` points into
`translations.json`.

## Deployment

Build the CSS, then copy these files to the web server:

- `index.html`
- `translations.json`
- `projects.json`
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
