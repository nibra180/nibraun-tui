# nibraun.de – Personal Resume Website

Persönliche Portfolio-Website im TUI/Terminal-Stil.

![Everforest Theme](https://img.shields.io/badge/theme-Everforest-83c092?style=flat-square)
![Static Site](https://img.shields.io/badge/deployment-static-blue?style=flat-square)
![Languages](https://img.shields.io/badge/lang-DE%20%7C%20EN-black?style=flat-square)

## Features

- **Terminal-Ästhetik** – Inspiriert von klassischen CLI-Interfaces
- **Everforest Farbschema** – Dark & Light Mode mit System-Präferenz-Erkennung
- **Statisches Deployment** – Fertige Dateien können ohne Server-Logik deployed werden
- **Responsive Design** – Mobile-first mit Tailwind CSS
- **DE/EN i18n** – Sprachumschaltung mit Browser-/LocalStorage-Fallback
- **Typewriter-Effekt** – Animierte Command-Eingabe im Hero
- **Scroll Animations** – Sanfte Section-Reveals
- **Accessibility** – Semantisches HTML, ARIA-Labels, Keyboard-Navigation
- **GitHub Project Meta** – Release-Versionen und letzte Updates für Projektkarten
- **Local Cache** – GitHub-Metadaten werden clientseitig per `localStorage` zwischengespeichert

## Tech Stack

- HTML5
- Tailwind CSS (CLI-build)
- Vanilla JavaScript
- `translations.js` für i18n
- `projects.js` für Projektdaten
- `github-project-meta.js` für GitHub-Release-/Update-Metadaten
- Everforest Color Palette

## Farbschema

Das Design nutzt die [Everforest](https://github.com/sainnhe/everforest) Farbpalette:

| Variable | Dark | Light | Verwendung |
|----------|------|-------|------------|
| `--terminal-bg` | `#2d353b` | `#fdf6e3` | Hintergrund |
| `--terminal-accent` | `#a7c080` | `#8da101` | Akzentfarbe, Links |
| `--terminal-green` | `#a7c080` | `#8da101` | Shopware, Success |
| `--terminal-cyan` | `#83c092` | `#35a77c` | Flutter, Info |
| `--terminal-purple` | `#d699b6` | `#df69ba` | Frontend |
| `--terminal-amber` | `#dbbc7f` | `#dfa000` | Backend |
| `--terminal-red` | `#e67e80` | `#f85552` | Dev Workflow |

## Entwicklung

```bash
npm install
npm run build
```

Für Tailwind während der Entwicklung:

```bash
npm run dev:css
```

Für Deployment werden diese Dateien benötigt:

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
- **Arbeitgeber**: [Sharpness Solutions GmbH](https://sharpness.de)

## Lizenz

Privates Projekt. Code dient als Referenz.
