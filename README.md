# nibraun.de – Personal Resume Website

Persönliche Portfolio-Website im TUI/Terminal-Stil.

![Everforest Theme](https://img.shields.io/badge/theme-Everforest-83c092?style=flat-square)
![Single File](https://img.shields.io/badge/deployment-single--file-blue?style=flat-square)
![German](https://img.shields.io/badge/lang-DE-black?style=flat-square)

## Features

- **Terminal-Ästhetik** – Inspiriert von klassischen CLI-Interfaces
- **Everforest Farbschema** – Dark & Light Mode mit System-Präferenz-Erkennung
- **Single-File Deployment** – Keine Build-Tools, kein Server-Setup
- **Responsive Design** – Mobile-first mit Tailwind CSS
- **Typewriter-Effekt** – Animierte Command-Eingabe im Hero
- **Scroll Animations** – Sanfte Section-Reveals
- **Accessibility** – Semantisches HTML, ARIA-Labels, Keyboard-Navigation

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Everforest Color Palette

## Projektstruktur

```
new-tui-idea/
├── index.html          # Komplette Website (HTML + CSS + JS)
├── img/
│   └── warikoda-logo.png
├── AGENTS.md           # Guidelines für AI-Assistenten
└── README.md
```

## Lokale Entwicklung

```bash
# Mit Python
python -m http.server 8000

# Mit Node.js
npx serve .

# Mit PHP
php -S localhost:8000
```

Dann öffne [http://localhost:8000](http://localhost:8000)

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

## Sections

1. **Hero** – Terminal-Fenster mit Intro + Pinned Projects
2. **About** – `cat profile.config`
3. **Skills** – Accordion mit 5 Kategorien
4. **Experience** – Timeline mit Karriere-Stationen
5. **Stack** – Aktive Technologien
6. **WariKoda** – Open Source Projekte
7. **Contact** – Kontaktmöglichkeiten

## Links

- **Live**: [nibraun.de](https://nibraun.de)
- **GitHub**: [github.com/nibra180](https://github.com/nibra180)
- **WariKoda**: [github.com/WariKoda](https://github.com/WariKoda)
- **Arbeitgeber**: [Sharpness Solutions GmbH](https://sharpness.de)

## Lizenz

Privates Projekt. Code dient als Referenz.

---

Built with clean code, caffeine and curiosity.
