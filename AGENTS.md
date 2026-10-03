# Agent Guidelines – nibraun.de

## Projektübersicht

Persönliche Website für Niklas Braun: Softwareentwicklung und Fotografie.
Navigation auf allen Seiten: **Home – Dev – Photos** (Deutsch: Fotos).
Gefüllte, abgerundete Icons und aktive Unterstreichung sind farbcodiert:
Home violett, Dev blau, Photos grün; kleine Beschriftungen behalten die Textfarbe.
Standard Englisch; deutsche Seiten liegen unter `/de/`.

| Seite | EN / DE | Inhalt |
|---|---|---|
| Home | `/` / `/de/` | Große Begrüßung, persönlicher Teaser, Dev/Photos-Vorschaukarten, zufälliges Hero-Foto mit Galerie und Jahr |
| Dev | `/dev/` / `/de/dev/` | Projektindex mit Previews, Erfahrung, Stack und Kontakt; kein Fotoabschnitt |
| Photos | `/photos/` / `/de/photos/` | Galerieübersicht mit kompakten Thumbnail-Karten |
| Galerie | `/photos/<slug>/` / `/de/photos/<slug>/` | Responsive Fotosequenz, optionale Bildunterschriften |

## Tech Stack

- Statischer Build mit Node.js; kein PHP oder Twig auf dem Webserver nötig
- **Twig.js** (`twig`) als Build-Dependency; Templates in `src/templates/`
- Tailwind CSS v4, CSS-first; Designsystem in `src/tailwind.css`
- Geist für Fließtext und Headlines, Geist Mono für Labels und Daten; selbst gehostet in `fonts/`
- Vanilla JS im Browser, keine Browser-Runtime-Dependencies
- `sharp` erzeugt optimierte AVIF-, WebP- und JPEG-Bilder beim Build

## Templates und Build

- `src/templates/layout.twig`: gemeinsamer Seitenrahmen mit Blocks für Inhalt und Scripts
- `pages/{home,dev,photos,gallery}.twig`: Seiten via `{% extends %}`
- `partials/`: gemeinsamer Header, Footer, Theme-Steuerung und Browser-Scripts
- `components/`: Picture, Projektcover, Projektzeile, Projektpreview und Fotokarte
- Wiederkehrendes Markup über `{% include %}` teilen, nicht zwischen Seiten kopieren
- `scripts/templates.mjs`: zentraler Renderer mit Autoescaping und strikter Variablenprüfung
- `scripts/build-html.mjs`: Home/Dev, strukturierte Daten, Sitemap und `llms.txt`
- `scripts/build-photos.mjs`: Bildvarianten und Fotoseiten
- Generiertes HTML niemals direkt bearbeiten; Templates/Daten ändern und neu bauen
- HTML gehört in Twig, Datenaufbereitung und Bildverarbeitung in Build-Scripts
- Übersetzungen über `t('key')`; fehlende Übersetzungen müssen den Build abbrechen
- `|raw` nur für bewusst vertrauenswürdiges HTML und sicher serialisiertes Script-JSON
- Script-JSON über `scriptJson()` erzeugen, damit Inhalte kein `<script>` schließen können

## Designrichtung

**Radikal reduziert, Monokai Pro.** Zwei Themes: Light Sun und Dark.
Farben ausschließlich aus den bestehenden `--c-*`-Tokens in `src/tailwind.css`.

- Sechs Monokai-Akzente: Rot, Orange, Gelb, Grün, Blau und Violett
- Topbar: abwechselnde Farbstreifen mit welliger Unterkante
- Dev: Projektindex mit Hover-/Fokus-Previews auf Desktop; mobile Projektkarten
- Home: zufälliges Foto aus allen Galerien, verlinkt zur zugehörigen Galerie;
  gerader, abwechselnd farbiger Rahmen, keine Wellenränder; Galerie/Jahr darunter.
  Text und Foto erscheinen einmalig leicht versetzt, nur ohne Reduced-Motion-Präferenz
- Fotoübersicht: kleine Thumbnails mit getöntem Rahmen, ohne `border-top`;
  dezenter Zoom bei Hover/Fokus
- Gemeinsame Außenbreite und Headerposition auf allen Seiten; stabiler Scrollbar-Platz
- Mobil nutzen Fotokarten die volle Inhaltsbreite; Desktop-Karten bleiben kompakt
- Akzentfarben erreichen nicht immer ausreichenden Kontrast für kleine Schrift;
  Fließtext und kleine Labels verwenden Vordergrundtokens

## Konventionen

- Eigene Styles nur in `src/tailwind.css`; keine Inline-Styles oder neuen Hex-Werte außerhalb der Tokens
- Kein zusätzliches `*`-Reset: Tailwind Preflight übernimmt das
- Sections mit `<!-- ==================== NAME ==================== -->` markieren
- Semantisches HTML, sichtbarer Fokus, passende `aria-current`-Zustände und Touch-Ziele
- `prefers-reduced-motion` respektieren; keine Endlosschleifen oder unnötigen Animationen
- Browserlogik in den Script-Partials, eingebunden im gemeinsamen `DOMContentLoaded`-Handler;
  Theme-Initialisierung vor dem ersten Paint ist die Ausnahme
- Website-Texte ausschließlich in `translations.json`, jeweils Deutsch und Englisch
- Code-Kommentare und Commit-Messages auf Englisch; keine Emojis in Dokumentationen
- Kleine, gezielte Änderungen; bestehende Templates und Komponenten wiederverwenden

## Daten und Fotografie

- `projects.json`: Softwareprojekte; `stack.json`: Stack-Gruppen
- `github-project-meta.js`: Live-GitHub-Metadaten, nur auf Dev benötigt
- `photos.json`: Galerien in Anzeigereihenfolge; `slug`, Übersetzungsschlüssel und Bildliste
- Originale in `photo-originals/<slug>/`; gitignored, separat sichern, niemals deployen
- Bildbeschreibungen (`altKey`) in beiden Sprachen erforderlich; `captionKey` optional
- Optionales Galerie-Feld `year` liefert das Jahr für die Home-Fotobeschriftung
- `teaser: true` wählt das Thumbnail, sonst das erste Foto der Galerie
- Webvarianten in `img/photos/` sind gitignored und müssen vor Deployment gebaut werden
- EXIF/GPS entfernen, Orientierung korrigieren, kleine Originale nicht hochskalieren
- Responsive Pictures mit intrinsischen Größen; erstes Galeriebild eager, weitere lazy
- Neue Galerien automatisch in Übersicht, Sitemap und Home-Hero-Auswahl aufnehmen

## Build, Tests und Deployment

```bash
npm install
npm run build       # CSS, alle lokalisierten HTML-Seiten, Bilder, Sitemap und llms.txt
npm run build:html  # Nur HTML/Bilder und Metadaten
npm run build:css   # Nur CSS
npm test
npm run serve       # Statischer Server auf http://localhost:8000
```

Deploy ins Webserver-Root: `index.html`, `dev/`, `photos/`, `de/`,
`dist/tailwind.css`, `fonts/`, `img/`, `github-project-meta.js`, `robots.txt`,
`sitemap.xml` und `llms.txt`.

Nicht deployen: `src/`, `scripts/`, `node_modules/`, `photo-originals/` oder
Konfigurationsdateien mit Zugangsdaten. Alle Pfade sind domain-root-relativ.
Weitere Build- und Fotografiehinweise stehen in `README.md`.

## Kontakt & Links

- Website: nibraun.de
- GitHub: github.com/nibra180
- WariKoda: github.com/WariKoda
- Arbeitgeber: Sharpness Solutions GmbH
