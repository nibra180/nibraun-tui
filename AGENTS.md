# Agent Guidelines – nibraun.de

## Projektübersicht

Persönliche Portfolio-Website für Niklas Braun. Zweck der Seite ist ein
**Schaufenster für veröffentlichte Software** – der Work-Index steht direkt
unter dem Hero, alles andere stützt ihn.

## Tech Stack

- **Static Deployment**: `index.html`, `translations.js`, `projects.js`, `github-project-meta.js`, `dist/tailwind.css`, `img/`
- **Styling**: Tailwind CSS v4 (CSS-first, keine `tailwind.config.js`)
- **Quelle des Designsystems**: `src/tailwind.css`
- **Typografie**: Archivo (variable, `wdth` 62–125) für Display und Body, IBM Plex Mono für Labels und Daten
- **JavaScript**: Vanilla JS, keine Runtime-Dependencies im Browser

## Designrichtung

Swiss-Brutalist. **Ein einziges, helles Theme** – Zeitungspapier, fast schwarze
Tinte, genau eine Signalfarbe (Ultramarin). Kein Dark Mode, keine
`prefers-color-scheme`-Behandlung, kein Theme-Toggle.

- Harte Kanten, kein `border-radius`
- Struktur läuft **horizontal**: schwere Trennlinien (2px `--c-rule-hard`) zwischen den Bändern, Haarlinien (1px `--c-rule`) zwischen den Zeilen
- **Keine sichtbaren Spaltenlinien.** Ein durchgehendes vertikales Raster wurde
  getestet und wieder entfernt: es hat den Fließtext zerschnitten und war beim
  Lesen störend. Das Layout folgt weiter einem Spaltenraster, zeichnet es aber nicht
- Flächen statt Akzente: Signal- und Invert-Flächen tragen ganze Blöcke
- Karten liegen eine Stufe **heller** als die Seite (`--c-card`), nie dunkler
- Terminal-Bezug nur noch als Detailebene (Mono-Labels, Datenspalten), nicht als Farbschema

## Farbtokens

Rohwerte liegen auf `--c-*` in `:root`. Tailwind liest sie über `@theme inline`.

| Token | Wert | Bedeutung |
|---|---|---|
| `--c-ink` | `#e9e9e4` | Seitenhintergrund |
| `--c-card` | `#f4f4f0` | erhöhte Kartenfläche |
| `--c-fg` / `--c-fg-dim` | `#14151a` / `#4b4d54` | Text / abgesetzter Text |
| `--c-rule` / `--c-rule-hard` | `#c0c0b7` / `#14151a` | Haarlinie / schwere Linie |
| `--c-signal` / `--c-signal-text` | `#211ad4` | Signalfläche / Signaltext |
| `--c-invert-bg` / `--c-on-invert` | `#14151a` / `#e9e9e4` | invertierte Fläche und ihr Vordergrund |

Drei Tokenpaare sehen redundant aus, sind es aber nicht. `--c-signal` und
`--c-invert-bg` sind **Füllfarben** und werden nie umgeschrieben;
`--c-signal-text` und `--c-fg` sind **Vordergrundfarben**, die `.on-fill` auf
`currentColor` umschreibt. Wird ein Paar zusammengelegt, zieht eine gefüllte
Fläche ihren Hintergrund aus der eigenen Textfarbe und verschwindet.

## Konventionen

### CSS
- Alles Eigene liegt in `src/tailwind.css`, nicht inline in `index.html`
- Keine neuen Hex-Werte außerhalb des Tokenblocks
- **Kein `*`-Reset hinzufügen.** Preflight erledigt das bereits; eine ungelayerte
  Wiederholung schlägt sämtliche Tailwind-Abstandsklassen
- Flächen (`.band-signal`, `.band-invert`, gefüllte Bento-Karten) tragen
  zusätzlich `.on-fill`, damit Linien und Sekundärtext aus `currentColor` ableiten

### HTML
- Sections mit `<!-- ==================== NAME ==================== -->` markiert
- Nummerierung nur, wo sie echte Information trägt (Work-Index, Jahreszahlen im Werdegang)
- Accessibility: semantische Elemente, `aria-*`, sichtbarer Fokus

### Sprache
- Website-Inhalt: Deutsch und Englisch, Standard Englisch
- Beide Sprachen ausschließlich über `translations.js` pflegen
- Code-Kommentare und Commit-Messages: Englisch

### JavaScript
- Alles im `DOMContentLoaded`-Handler in `index.html`
- Projektdaten in `projects.js`, GitHub-Metadaten in `github-project-meta.js`
- Ziele mit `data-repo-bare` drucken Werte ohne Präfix (für Tabellenspalten)

## Sections

| Section | Inhalt |
|---|---|
| Hero | Displayzeilen, Lede, Status |
| Work | Index veröffentlichter Software mit Live-Release und Last-Push aus der GitHub-API |
| WariKoda | Open Source mit @bdgraue, invertierte Fläche |
| Skills | Bento-Grid, 5 Felder, eine invertierte und eine Signal-Karte, darunter Stack-Kolophon |
| Path | Beruflicher Werdegang |
| Profile | Kurzprofil und Schwerpunkte |
| Contact | Signalfläche mit Kontaktdaten |

## Dos & Don'ts

### Do
- Boldness an einer Stelle bündeln: der Work-Index ist das Signature-Element
- Mobile-first denken; Displayzeilen dürfen unter 40rem umbrechen
- `prefers-reduced-motion` respektieren
- Änderungen klein und gezielt halten

### Don't
- Keine externen JS-Libraries oder Runtime-Dependencies
- Keinen Dark Mode wieder einführen
- Keine zweite Akzentfarbe einführen
- Keine Texte außerhalb der i18n-Struktur pflegen
- Keine Emojis in Dokumentationen

## Build & Deployment

```bash
npm install
npx tailwindcss -i ./src/tailwind.css -o ./dist/tailwind.css --minify   # oder: npm run build
npm run serve                                                            # lokal auf :8000
```

Statisches Deployment – die oben gelisteten Dateien direkt auf einen Webserver kopieren.

## Kontakt & Links

- **Website**: nibraun.de
- **GitHub**: github.com/nibra180
- **WariKoda**: github.com/WariKoda
- **Arbeitgeber**: Sharpness Solutions GmbH
