# Agent Guidelines – nibraun.de

## Projektübersicht

Persönliche Portfolio-Website für Niklas Braun. Zweck der Seite ist ein
**Schaufenster für veröffentlichte Software** – der Work-Index steht direkt
unter dem Hero, alles andere stützt ihn.

## Tech Stack

- **Static Deployment**: `index.html`, `translations.js`, `projects.js`, `github-project-meta.js`, `dist/tailwind.css`, `img/`
- **Styling**: Tailwind CSS v4 (CSS-first, keine `tailwind.config.js`)
- **Quelle des Designsystems**: `src/tailwind.css`
- **Typografie**: Instrument Sans (variable, `wdth` 75–100) für Display und Body, Martian Mono für Typenschilder, Skalen und Daten
- **JavaScript**: Vanilla JS, keine Runtime-Dependencies im Browser

## Designrichtung

**BRAUN: Datenblatt.** Ein einziges, helles Theme nach der Formensprache
klassischer Braun-Geräte: Gehäuse statt Papier, Fugen statt schwerer Linien,
Skalen statt Ornament und genau eine orange Signalfarbe für aktive Zustände und
Messwerte. Kein Dark Mode, keine `prefers-color-scheme`-Farbbehandlung, kein
Theme-Toggle.

- Drei Flächenebenen: Gehäuse (`--c-shell`), Baugruppe (`--c-panel`) und
  vertiefte Blende (`--c-bezel`)
- Harte Kanten; der runde Sprachregler ist als einziges Bedienelement die einzige
  Ausnahme
- Baugruppen werden durch 2px breite Gehäusefugen getrennt, Inhalte durch
  zurückhaltende Teilstriche und Haarlinien
- **Keine sichtbaren Spaltenlinien.** Das Layout folgt einem Spaltenraster,
  zeichnet es aber nicht durch den Fließtext
- Der Work-Index ist das Messinstrument: Release-Kontrollleuchten und eine aus
  Live-GitHub-Daten gespeiste Aktivitätsskala
- Das abstrakte Messfeld im Hero ist bewusst dekorativ, bleibt ohne Scheindaten
  und konkurriert nicht mit den echten Messwerten im Work-Index
- Martian Mono dient als Gerätebeschriftung, nicht als Terminal-Farbschema

## Farbtokens

Rohwerte liegen auf `--c-*` in `:root`. Tailwind liest sie über `@theme inline`.

| Token | Wert | Bedeutung |
|---|---|---|
| `--c-shell` | `#d6d3cb` | Gehäuse und Seitenhintergrund |
| `--c-panel` | `#eeece7` | helle Baugruppe und Sektionsfläche |
| `--c-bezel` | `#c4c0b6` | vertiefte Blende, Tags und Skalengrund |
| `--c-fg` / `--c-fg-dim` | `#1a1917` / `#6c675e` | Beschriftung / Sekundärtext |
| `--c-rule` | `#bdb9ae` | Teilstrich und Fuge innerhalb eines Panels |
| `--c-signal` | `#e8590c` | Kontrollleuchte, Zeiger und aktive Grafik |
| `--c-signal-text` | `#9a3412` | kontraststarker Signaltext |
| `--c-on-signal` | `#1a1917` | Vordergrund auf Signalflächen |
| `--c-invert-bg` / `--c-on-invert` | `#1a1917` / `#e6e3dc` | invertierte Baugruppe und ihr Vordergrund |

**`--c-signal` ist niemals Textfarbe.** Orange erreicht auf `--c-panel` nicht
den erforderlichen Kontrast für kleine Schrift. Links und Signalbeschriftungen
verwenden immer `--c-signal-text`. Füll- und Vordergrundrollen bleiben getrennt,
weil `.on-fill` nur Vordergrundrollen auf `currentColor` umschreibt.

## Konventionen

### CSS
- Alles Eigene liegt in `src/tailwind.css`, nicht inline in `index.html`
- Keine neuen Hex-Werte außerhalb des Tokenblocks
- **Kein `*`-Reset hinzufügen.** Preflight erledigt das bereits; eine ungelayerte
  Wiederholung schlägt sämtliche Tailwind-Abstandsklassen
- Flächen (`.band-signal`, `.band-invert`, gefüllte Bento-Karten) tragen
  zusätzlich `.on-fill`, damit Linien und Sekundärtext aus `currentColor` ableiten
- `--c-signal` nie über `color` einsetzen; Text nimmt `--c-signal-text`
- Keine weiteren runden Elemente neben dem Sprachregler hinzufügen

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
| Hero | Wortmarke, Erfahrungsanreißer, dekoratives Messfeld und Typenschild |
| Work | Messinstrument mit Live-Release-Leuchten und Last-Push-Skalen aus der GitHub-API |
| WariKoda | invertierte Open-Source-Baugruppe mit @bdgraue |
| Skills | Bedienfeld mit 5 Feldern, vertieften Tags und Stack-Kolophon |
| Path | berufliche Zeitskala und Werdegang |
| Profile | Kurzprofil, Typenschild und Schwerpunkte |
| Contact | Signalfläche mit Typenschild und Kontaktdaten |

## Dos & Don'ts

### Do
- Boldness an einer Stelle bündeln: der Work-Index ist das Signature-Element
- Mobile-first denken; die Wortmarke darf auf schmalen Viewports umbrechen, nicht auf unlesbare Größe schrumpfen
- `prefers-reduced-motion` respektieren
- Animationen nur einmalig und funktional einsetzen: Aufbau, Zeitverlauf oder echte Datenzustände; keine Endlosschleifen
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
