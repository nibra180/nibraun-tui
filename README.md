# nibraun.de – Personal Portfolio

Personal portfolio website for Niklas Braun, built as a showcase for published software.

![Static Site](https://img.shields.io/badge/deployment-static-111214?style=flat-square)
![Tailwind](https://img.shields.io/badge/tailwind-v4-5b57ff?style=flat-square)
![Languages](https://img.shields.io/badge/lang-DE%20%7C%20EN-111214?style=flat-square)

## Screenshot

![nibraun.de screenshot](img/nibraun-tui-001.png)

## Design

Swiss-brutalist: heavy horizontal rules, oversized Archivo Expanded headlines, and
a single light palette — newsprint paper, near-black ink, and one ultramarine
signal colour. The work index sits directly below the hero and pulls release tags
and last-push dates live from the GitHub API.

## Features

- **Work index** – Published repositories with live release and last-push data
- **One considered theme** – Light only, tuned for paper rather than split across two modes
- **DE/EN i18n** – Language toggle backed by `?lang=` and `localStorage`
- **Static deployment** – Ready-to-serve files, no server-side logic
- **No runtime dependencies** – Vanilla JavaScript only
- **Responsive** – Mobile-first, headlines reflow rather than shrink on small screens
- **Accessible** – Semantic HTML, ARIA labels, visible focus, `prefers-reduced-motion` respected
- **Local cache** – GitHub metadata cached client-side for six hours

## Tech Stack

- HTML5
- Tailwind CSS v4 (CSS-first configuration in `src/tailwind.css`)
- Vanilla JavaScript
- Archivo and IBM Plex Mono
- `translations.js` for i18n
- `projects.js` for the work index entries
- `github-project-meta.js` for GitHub release and update metadata

## Palette

Raw values live on `--c-*` and are exposed to Tailwind through `@theme inline`.

| Token | Value | Usage |
|---|---|---|
| `--c-ink` | `#e9e9e4` | Page background |
| `--c-card` | `#f4f4f0` | Raised card surface, a step above the page |
| `--c-fg` | `#14151a` | Text and heavy rules |
| `--c-fg-dim` | `#4b4d54` | Secondary text |
| `--c-rule` | `#c0c0b7` | Hairlines between rows |
| `--c-signal` | `#211ad4` | Filled blocks and active states |
| `--c-signal-text` | `#211ad4` | Signal-coloured text |
| `--c-invert-bg` | `#14151a` | Inverted block background |

`--c-signal` / `--c-invert-bg` are fill colours and are never rewritten.
`--c-signal-text` / `--c-fg` are foreground colours that `.on-fill` rewrites to
`currentColor`, so a filled block's contents inherit the right contrast.

## Development

```bash
npm install
npm run build     # one-off minified build
npm run dev       # watch mode
npm run serve     # static server on :8000
```

Files required for deployment:

- `index.html`
- `translations.js`
- `projects.js`
- `github-project-meta.js`
- `dist/tailwind.css`
- `img/`

## Links

- **Live**: [nibraun.de](https://nibraun.de)
- **GitHub**: [github.com/nibra180](https://github.com/nibra180)
- **WariKoda**: [github.com/WariKoda](https://github.com/WariKoda)
- **Employer**: [Sharpness Solutions GmbH](https://sharpness.de)

## License

This repository is publicly visible, but it is not licensed for free use, reproduction, modification, or redistribution.

All rights reserved.
