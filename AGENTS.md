# Agent Guidelines – nibraun.de

## Projektübersicht

Persönliche Website für Niklas Braun: Softwareentwicklung und Fotografie.
Navigation auf allen Seiten: **Home – Work – Photos** (Deutsch: Arbeit, Fotos).
Gefüllte, abgerundete Icons und aktive Unterstreichung sind farbcodiert:
Home violett, Work blau, Photos grün; kleine Beschriftungen behalten die Textfarbe.
Standard Englisch; deutsche Seiten liegen unter `/de/`.

| Seite | EN / DE | Inhalt |
|---|---|---|
| Home | `/` / `/de/` | Große Begrüßung, persönlicher Teaser, Work/Photos-Vorschaukarten; Fotos-Kachel mit zufälligem Galerie-Titelbild |
| Work | `/work/` / `/de/work/` | Projektindex mit Previews, Erfahrung, Stack und Kontakt; kein Fotoabschnitt |
| Photos | `/photos/` / `/de/photos/` | Galerieübersicht mit kompakten Thumbnail-Karten |
| Galerie | `/photos/<slug>/` / `/de/photos/<slug>/` | Responsive Fotosequenz, optionale Bildunterschriften |
| Impressum | `/imprint/` / `/de/impressum/` | Betreiber und Kontakt |
| Datenschutz | `/privacy/` / `/de/datenschutz/` | Hosting, Browser-Speicher, E-Mail, Rechte |

## Tech Stack

- Statischer Build mit Node.js; kein PHP oder Twig auf dem Webserver nötig
- **Twig.js** (`twig`) als Build-Dependency; Templates in `src/templates/`
- Tailwind CSS v4, CSS-first; Designsystem in `src/tailwind.css`
- Geist für Fließtext und Headlines, Geist Mono für Labels und Daten; selbst gehostet in `fonts/`
- Vanilla JS im Browser, keine Browser-Runtime-Dependencies
- `sharp` erzeugt optimierte AVIF-, WebP- und JPEG-Bilder beim Build

## Templates und Build

- `src/templates/layout.twig`: gemeinsamer Seitenrahmen mit Blocks für Inhalt und Scripts
- `pages/{home,work,photos,gallery,legal}.twig`: Seiten via `{% extends %}`
- `partials/`: gemeinsamer Header, Footer, Theme-Steuerung und Browser-Scripts
- `components/`: Picture, Projektcover, Projektzeile, Projektpreview und Fotokarte
- Wiederkehrendes Markup über `{% include %}` teilen, nicht zwischen Seiten kopieren
- `scripts/templates.mjs`: zentraler Renderer mit Autoescaping und strikter Variablenprüfung
- `scripts/build-html.mjs`: Home/Work, Rechtstexte, strukturierte Daten, Sitemap und `llms.txt`
- `scripts/paths.mjs`: Sprachabhängige Rechtstext-Routen; Footer-Links auf allen Seiten
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
- Work: Projektindex mit Hover-/Fokus-Previews auf Desktop; mobile Projektkarten
- Home: Work/Photos-Kacheln auf Desktop neben dem Text, mobil darunter; kein separates Hero-Foto.
  Die Fotos-Kachel zeigt zufällig eines der Galerie-Titelbilder und verlinkt zur Fotoübersicht.
  Ohne JavaScript erscheint das Titelbild der ersten Galerie. Keine Einblendanimationen.
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
- `legal.json`: bestätigte Betreiber-/Hosterdaten, Fehlerlog-Frist und Prüfdatum; Build-Input
- Rechtstexte in beiden Sprachen in `translations.json`; keine unbekannten Angaben erfinden
- Hosting: Hetzner-Server `hafen` (Falkenstein) mit Caddy, keine Zugriffslogs,
  Fehlerlogs im System-Journal höchstens 14 Tage; Kontakt-E-Mail bei netcup.
  Bei Änderungen an Hosting, Logs oder `localStorage` die Datenschutzerklärung prüfen
- `404.html` und `de/404.html` liefert Caddy für unbekannte Pfade aus; `noindex`, nicht in der Sitemap
- Keine automatischen GitHub-API-Abrufe oder Repository-Caches im Besucher-Browser;
  Projektlinks zu GitHub bleiben normale externe Links
- `photos.json`: Galerien in Anzeigereihenfolge; `slug`, Übersetzungsschlüssel und Bildliste
- Originale in `photo-originals/<slug>/`; gitignored, separat sichern, niemals deployen
- Bildbeschreibungen (`altKey`) in beiden Sprachen erforderlich; `captionKey` optional
- Optionales Galerie-Feld `year` speichert das Jahr der Serie
- Maximal ein `teaser: true` pro Galerie wählt Titelbild, Übersichts-Thumbnail und Home-Kandidat;
  dieses Bild steht automatisch zuerst, die übrige Reihenfolge bleibt erhalten.
  Ohne Markierung wird das erste Foto verwendet; mehrere Markierungen brechen den Build ab
- Webvarianten in `img/photos/` sind gitignored und müssen vor Deployment gebaut werden
- EXIF/GPS entfernen, Orientierung korrigieren, kleine Originale nicht hochskalieren
- Responsive Pictures mit intrinsischen Größen; erstes Galeriebild eager, weitere lazy
- Neue Galerien automatisch in Übersicht, Sitemap und Home-Fotokachel-Auswahl aufnehmen

## Build, Tests und Deployment

```bash
npm install
npm run build       # CSS, alle lokalisierten HTML-Seiten, Bilder, Sitemap und llms.txt
npm run build:html  # Nur HTML/Bilder und Metadaten
npm run build:css   # Nur CSS
npm test
npm run serve       # Statischer Server auf http://localhost:8000
npm run deploy      # Build, Tests und rsync nach hafen:/srv/nibraun.de
```

Deploy ins Webserver-Root: `index.html`, `work/`, `photos/`, `imprint/`, `privacy/`, `de/`,
`dist/tailwind.css`, `fonts/`, `img/`, `robots.txt`,
`sitemap.xml` und `llms.txt`.

Nicht deployen: `src/`, `scripts/`, `node_modules/`, `photo-originals/` oder
Konfigurationsdateien mit Zugangsdaten. Alle Pfade sind domain-root-relativ.
Weitere Build- und Fotografiehinweise stehen in `README.md`.

## Kontakt & Links

- Website: nibraun.de
- GitHub: github.com/nibra180
- WariKoda: github.com/WariKoda
- Arbeitgeber: Sharpness Solutions GmbH
