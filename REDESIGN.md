# Nanook Landing Page — Redesign Protokoll

## Ausgangslage

Die Nanook Landing Page war eine Standard-Docusaurus-v1-Seite mit generischem Styling (`css/main.css`). Das Ziel des Redesigns ist ein **Industrial Brutalist UI Design** mit zwei Themes: einem dunklen "Tactical Telemetry"-Modus und einem hellen "Swiss Industrial Print"-Modus.

---

## Commit-Historie (chronologisch)

### 1. Redesign INIT — `867bf3b` (2026-03-27, 16:05)

**Umfang:** Grundlegende Neugestaltung der gesamten Landing Page.

**Neue Dateien:**
- `css/brutalist.css` — Komplett neues Design System (~970 Zeilen), bestehend aus:
  - Dual-Theme Custom Properties (Tactical Dark / Swiss Light)
  - CRT-Scanline-Overlay-Effekt
  - Neues Header-Layout mit Bracket-Navigation (`[ DOCS ]`, `[ API ]`, `[ GITHUB ]`)
  - Hero-Section mit Terminal-Ästhetik (`SYS.NANOOK // REV 2.0`, `STATUS: OPERATIONAL`)
  - Feature-Cards im Karteikarten-Stil mit Unit-IDs (`UNIT / M-01` etc.)
  - Trust-Logos-Section
  - Footer im Brutalist-Stil
  - Theme-Toggle (CRT / INK)
  - Responsive Design
- `.gitignore` — Hinzugefuegt

**Geaenderte Dateien:**
- `index.html` — Komplett neu strukturiert:
  - Neues HTML-Markup mit `data-theme="tactical"` am Body
  - CRT-Overlay, Header mit Theme-Toggle, Hero mit Diagramm-Frame, Features-Grid, Trust-Section, Footer
  - Inline-JavaScript fuer Theme-Persistenz via `localStorage`
  - Google Fonts: Inter (800, 900) + JetBrains Mono (400, 700)
- `en/index.html` — Englische Spiegelung der gleichen Aenderungen
- Alle Docs/Blog/Hilfe-Seiten — Minimale Aenderungen (vermutlich Meta-Tags/Links)
- `sitemap.xml` — Aktualisiert

---

### 2. Hero Watermark & Trust Logo — `4e2a2d6` (2026-03-27, 18:03)

**Neue Dateien:**
- `img/users/invoice-api-xhub.png` — Neues Trust-Logo

**Geaenderte Dateien:**
- `css/brutalist.css` — +82 Zeilen:
  - Hero-Watermark-Styling (grosses "N" im Hintergrund)
  - Dot-Matrix-Background-Pattern fuer Hero-Section
- `index.html` / `en/index.html` — Neue Elemente:
  - `<span class="hero-watermark">N</span>` im Hero
  - Trust-Logo mit Label (`invoice-api.xhub.io`)

---

### 3. Interaktiver Diagramm-Zoom & Datenfluss-Animation — `1aa7f48` (2026-03-28, 08:43)

**Geaenderte Dateien:**
- `css/brutalist.css` — +60 Zeilen:
  - Zoom-Effekt beim Hover ueber das Architektur-Diagramm
  - Animierte Datenfluss-Dots (pulsierende Punkte, die sich ueber das Diagramm bewegen)
  - `pulse-core` Animation
  - `data-dot` Keyframe-Animationen
- `index.html` / `en/index.html`:
  - `<div class="pulse-core">` — Pulsierender Kern-Indikator
  - `<span class="data-dot">` (3x) — Animierte Datenpunkte

---

## Aktueller Stand

### Implementierte Features
- **Dual-Theme-System:** Tactical Telemetry (Dark) + Swiss Industrial Print (Light) mit Toggle
- **CRT-Scanline-Overlay** im dunklen Modus
- **Hero-Section** mit Terminal-Metadaten, Watermark ("N"), Dot-Matrix-Background
- **Architektur-Diagramm** mit interaktivem Zoom-Effekt und animierten Datenfluss-Dots
- **Feature-Cards** (3 Karten: Equivalent Class Tables, Test Data Generation, Integrate Faster)
- **Trust-Logos:** Deutsche Bahn, Weltportfolio, invoice-api.xhub.io
- **Responsive Layout**
- **Theme-Persistenz** via localStorage

### Technologie
- Reines HTML/CSS/JS — kein Build-Step
- Google Fonts: Inter + JetBrains Mono
- CSS Custom Properties fuer Theme-Switching
- CSS Keyframe Animations fuer Datenfluss-Effekte

### Ungetrackte Dateien (Design-Varianten/Screenshots)
Die folgenden Dateien liegen im Root und sind noch nicht committet:
- `diagram-zoom-fixed.png`, `diagram-zoom-hover.png` — Screenshots des Zoom-Effekts
- `nanook-watermark-dark.png`, `nanook-watermark-light.png` — Watermark-Previews
- `variant2-blueprint-grid.png` bis `variant5-combo-v3.png` — Design-Varianten-Entwuerfe

### Dateistruktur (Redesign-relevant)
```
index.html              — Hauptseite (172 Zeilen)
en/index.html           — Englische Spiegelung
css/brutalist.css       — Design System (1110 Zeilen)
css/main.css            — Originales Docusaurus-CSS (weiterhin eingebunden)
img/arch.svg            — Architektur-Diagramm
img/users/              — Trust-Logos
```

---

## Offene Punkte / Naechste Schritte

### Bugs / Sofort-Fixes
- [x] **OG-Image:** Gefixt — alle Seiten verweisen jetzt auf `img/logo.svg`
- [x] **Leere alt-Attribute:** Gefixt — alle 3 Feature-Icons haben jetzt beschreibende alt-Texte
- [x] **Footer-Links:** Gefixt — `.html` Endungen entfernt, konsistent auf allen Seiten
- [x] **`.hero-inner` CSS-Rule:** Hinzugefuegt (flex column, center)

### Technische Schulden
- [x] **`css/main.css`:** Wird benoetigt fuer Docs/Blog-Seiten Layout — bleibt erhalten
- [x] **Ungenutzte Bilder entfernt:** 6 unreferenzierte Bilder geloescht (nanookblack.svg, overview.svg, oss_logo.png, LogoNanook.svg, language.svg, nanook.svg)

### SEO-Verbesserungen
- [x] **Schema.org Structured Data:** SoftwareApplication auf Startseite, BreadcrumbList auf Docs, Article auf Blog
- [x] **Canonical-Tag:** Alle 173 Seiten haben jetzt canonical Tags, /en/ zeigt auf root
- [x] **Robots Meta-Tag:** Alle Seiten haben `index, follow`
- [x] **robots.txt:** Erstellt, blockiert /en/ Duplikate
- [x] **Sitemap:** lastmod hinzugefuegt, redundante hreflang entfernt
- [x] **og:url:** Korrigiert auf allen Seiten (eigene URL statt root)
- [x] **WebP Bilder:** 37 WebP-Versionen generiert
- [x] **Bilder komprimiert:** 5 JPEGs um 75% verkleinert
- [x] **Font-Preloading:** `preload` fuer Google Fonts Stylesheet hinzugefuegt
