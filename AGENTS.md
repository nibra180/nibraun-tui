# Agent Guidelines – nibraun.de Resume Website

## Projektübersicht

Persönliche Portfolio-Website für Niklas Braun im TUI/Terminal-Stil mit Everforest-Farbschema.

## Tech Stack

- **Static Deployment**: Primär `index.html` plus `translations.js` für i18n
- **Styling**: Tailwind CSS (CDN), Custom CSS Variables
- **Farbschema**: Everforest Dark/Light Medium
- **JavaScript**: Vanilla JS, kein Build-Prozess

## Konventionen

### Sprache
- Website-Inhalt: **Deutsch und Englisch**
- Standard-Sprache: **Deutsch**
- Englische Inhalte über die i18n-Struktur pflegen
- Code-Kommentare: Englisch
- Commit-Messages: Englisch

### CSS
- Tailwind-Klassen bevorzugen
- Custom Properties für Farben in `:root` / `[data-theme="light"]`
- Naming: `--terminal-*` für Theme-Farben

### HTML-Struktur
- Sections mit `<!-- ==================== SECTION NAME ==================== -->` markiert
- Klassen für Interaktivität: `code-line` (Hover), `reveal-section` (Scroll-Animation)
- Accessibility: `aria-*` Attribute, semantische Elemente

### JavaScript
- Alles im `DOMContentLoaded` Event
- Keine externen Dependencies
- Übersetzungen für i18n dürfen in `translations.js` ausgelagert werden
- Features: Theme Toggle, Typewriter, Scroll Reveal, Mobile Menu, Language Toggle

## Wichtige Bereiche

| Section | Command/Header | Beschreibung |
|---------|----------------|--------------|
| Hero | Terminal-Fenster | whoami, focus, current, status + pinned projects |
| About | `cat profile.config` | Profil-Übersicht |
| Skills | `skills --list` | Accordion mit 5 Kategorien |
| Experience | `history --timeline` | Beruflicher Werdegang |
| Stack | `ls --stack` | Aktive Technologien |
| WariKoda | `cat warikoda/open-source.log` | Open Source Projekte |
| Contact | `contact --niklas` | Kontaktinformationen |

## Assets

- `img/warikoda-logo.png` – WariKoda Logo (200x200)
- Wird verwendet in: Hero pinned cards, WariKoda Section, OG/Twitter Meta

## Dos & Don'ts

### Do
- Terminal-Ästhetik beibehalten
- Everforest-Farben nutzen (`--terminal-*`)
- Mobile-first denken
- Hover-Effekte mit `code-line` Klasse
- Änderungen klein und gezielt halten

### Don't
- Keine externen JS-Libraries hinzufügen
- Keine separaten CSS/JS-Dateien erstellen, außer `translations.js` für i18n
- Keine ungepflegten Mischsprachen oder doppelt gepflegten Texte außerhalb der i18n-Struktur
- Keine Breaking Changes am Theme-System
- Keine Emojis in Dokumentationen (README, AGENTS, etc.)

## Deployment

Statisches Deployment – `index.html`, `translations.js` und Assets können direkt auf jeden Webserver kopiert werden.

```bash
# Lokal testen
cd new-tui-idea
python -m http.server 8000
# oder
npx serve .
```

## Kontakt & Links

- **Website**: nibraun.de
- **GitHub**: github.com/nibra180
- **WariKoda**: github.com/WariKoda
- **Arbeitgeber**: Sharpness Solutions GmbH
