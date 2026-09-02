# Design — Nanook Landing Page

A locked design system for this site. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow. (Hallmark multi-page contract: on this project,
**consistency wins over variety** — pages share the system; diversification is
inverted.)

Working rules for the repo itself (registration points, twins, deployment traps)
live in `AGENTS.md`. This file covers the visual system only.

> **2026-09-02 — system replaced.** The Industrial Brutalist system (dark
> telemetry default, Inter 900 display, JetBrains Mono body, red accent, CRT
> grain) was retired on the user's word ("diese Design hier übernehmen"). The
> old stylesheet stays on disk as `css/brutalist.css` for reference; nothing
> links to it. The system below is the one every page runs on now.

## Provenance

- **Source mode:** url · `hallmark study https://platform.claude.com/docs/en/home`
  (2026-09-02), followed by `hallmark redesign` on the user's instruction to
  adopt it site-wide.
- **Status of the source:** a public reference the user pointed at for their own
  brand's site. What was adopted is **structural**: macrostructure, archetypes,
  type roles, paper band, accent discipline, motion stance, rhythm of the
  section head. What was **not** adopted: the source's proprietary typefaces
  (replaced by free faces in the same roles, user's pick), its brand colour
  (Nanook keeps its own red, demoted to a mark), its copy, its imagery.
- **Confidence:** paper and accent bands are exact from the source CSS; the
  values below are Nanook's own, tuned inside those bands. Rhythm was not
  observable from HTML (URL-mode blind spot); section spacing below is a
  decision, not a measurement.

## Genre

modern-minimal — developer tool / API documentation register. Light paper, one
light serif display note, sans body, blue for interaction only, quiet ink
buttons, small radii, no reveals. Restraint with conviction.

## Macrostructure families

- **Landing page** (`/index.html`): **Ecosystem Index** — the page is a set of
  discovery surfaces (what it is · where to start · how it works · use cases ·
  questions · who uses it). Hero: **H2 Split Diptych**, ratio 6/6, headline +
  lede + three quiet CTAs left, a real code sample with tabs right (Install ·
  Generate · Output — all from the tutorials, never invented), divider =
  negative space. Section heads: **S2 Hanging** — h2 + one-sentence lead, no
  rules, no numbers, no eyebrows. Content blocks: 2-up/3-up card grids with
  whole-card links; the workflow as a horizontal **F4 step sequence rendered as
  a tab strip**; FAQ as quiet `<details>` rows; **T2 logo wall** hairline.
- **Content — blog index** (`/blog/`): **Index-First**. Display title + one
  factual sentence, then dated rows with hairlines. No sidebar.
- **Content — blog posts** (`/blog/YYYY/MM/DD/<slug>`): **Long Document**.
  One centered 44rem column; the article leads; related-posts index follows,
  open. No reveals.
- **Docs** (`/docs/**`): existing Docusaurus shell, themed via overrides —
  sidebar rail left (N3 register), prose column. **Hubs** (`/docs/`,
  `/docs/api/`, `/help`, `/users`): **Ecosystem Index** in miniature — display
  title + lead, then a 2-up grid of whole-card links (`.docs-hub`, CSS-only over
  the existing row markup).
- **Root pages** (`/about`, `/imprint`, `/privacyPolicy`): **Long Document**
  (`.long-doc`), centered 44rem column, serif display title, sans prose.
- **404**: status line, serif figure, three exits. `noindex`.

## Theme

Dual theme on `body[data-theme="light" | "dark"]`, **light is the default**
(user decision 2026-09-02; the previous default was dark). Neutrals carry the
brand hue **28** at very low chroma (0.003–0.008) so both themes stay one
family. All values OKLCH. Canonical definitions live in `css/nanook.css`
§ TOKENS — that file is the single source of truth; this table is the human
summary.

| Token | light (default) | dark |
| --- | --- | --- |
| `--bg-primary` (paper) | oklch(98.8% 0.003 28) | oklch(16% 0.004 28) |
| `--bg-secondary` (paper-2: code, stripes, hover) | oklch(96.8% 0.004 28) | oklch(20% 0.005 28) |
| `--bg-elevated` (cards) | oklch(99.6% 0.002 28) | oklch(23% 0.005 28) |
| `--fg-primary` (ink) | oklch(17% 0.004 28) | oklch(94% 0.004 28) |
| `--fg-secondary` | oklch(40% 0.006 28) | oklch(76% 0.005 28) |
| `--fg-dim` (muted) | oklch(50% 0.008 28) | oklch(64% 0.006 28) |
| `--link-accent` (links, active nav, tab underline) | oklch(43.3% 0.128 257) | oklch(74% 0.12 257) |
| `--accent` (focus ring, selection, small fills) | oklch(57.5% 0.163 256) | oklch(74% 0.12 257) |
| `--accent-ink` (text on `--accent`) | oklch(99% 0.003 28) | oklch(16% 0.004 28) |
| `--brand` (the mark only) | oklch(58.8% 0.20 28) | oklch(66% 0.18 28) |
| `--border-color` (hairline) | oklch(90% 0.005 28) | oklch(30% 0.006 28) |
| `--border-bright` (visible rule, inputs) | oklch(82% 0.008 28) | oklch(38% 0.007 28) |
| `--focus-ring` | = `--accent` | = `--accent` |

Accent discipline: **blue is for interaction** — links (underlined, offset
3px, underline at 40 % strength), active nav item, active tab, focus ring,
selection. **The brand red is a mark, not a colour**: it appears in exactly two
places, the small square after the wordmark and the 404 figure. Buttons are ink
on paper (primary: ink fill, paper text; secondary: hairline outline) — never
accent-filled. Contrast floor: WCAG 4.5:1 body / 3:1 large and rings, verified
in **both** themes on every change (ink 18.5:1 / 16.3:1, secondary 8.9 / 9.0,
muted 5.8 / 5.8, link 7.8 / 8.4, ring 4.3 / 8.4).

## Typography

- **Display**: **Source Serif 4**, weight **300** (landing h1, 52px cap) and
  **400** (article / hub / page titles, 31–39px). Optical size axis on. Roman
  only — headings are never italic. Tracking −0.01em. User decision
  2026-09-02 (replaces Inter 800/900).
- **Body / UI**: **IBM Plex Sans** 400 / 500 / 600 + italic 400. Everything
  that is not display or code: prose, nav, buttons, section h2/h3, card titles,
  labels, footer, cookie banner. Section h2 = Plex Sans 500 at 22px; card
  titles 600 at 16px; eyebrows and labels = muted Plex Sans, sentence case,
  **no uppercase tracking, no mono labels**.
- **Mono**: **JetBrains Mono** 400 / 600 — code blocks, inline code, the hero
  sample, tables of figures. Not a label voice any more.
- 2+1 rule: Source Serif 4 display · Plex Sans body · JetBrains Mono outlier
  (code only). Loaded via one Google Fonts `<link>` in every page head
  (Source Serif 4 opsz 8..60 / wght 300..400 · Plex Sans 400/500/600/i400 ·
  JetBrains Mono 400/600).
- Prose: 17px / 1.7 (`--text-reading`), lede 19px, measure `--measure` 68ch.
  Blog posts run one shared 44rem column; docs prose may let tables and code
  take the full column.
- Scale: `--text-*` (1.25 ratio) plus `--text-display` (clamp 2.5rem → 3.25rem)
  and `--text-display-s` (clamp 2rem → 2.44rem). Floor 12px on every label
  (`--text-xs`).

## Spacing · motion · layers

- 4-pt named scale `--space-3xs … --space-3xl` (+ `-sm2/-md2/-lg2` legacy
  4-pt steps). Named tokens only; no raw values in new code.
- Section rhythm on the landing page is **uneven on purpose**: hero 3rem top /
  4rem bottom (bottom-heavy, so it sits into the page), the definition tight
  on top, sections 3rem/4rem, the use-case anchor 4rem/6rem, the FAQ tight on
  top, the trust strip tight, footer generous (clamp 2.5–4rem). Container
  72rem, content left-aligned inside it.
- Radii: `--radius-sm` 4px (controls), `--radius-md` 6px (code, inputs),
  `--radius-card` 10px. The old `border-radius: 0 !important` is gone.
- Easings `--ease-out / --ease-in / --ease-in-out`; durations `--dur-micro`
  60ms · `--dur-short` 200ms · `--dur-long` 320ms. Motion stance:
  **motion-cut** — no entrance reveals anywhere (the source has none either).
  What moves: colour/underline on hover and the tab-panel crossfade (150ms).
  `prefers-reduced-motion` collapses even that.
- z-scale `--z-base … --z-overlay`; nav (`--z-sticky-nav` 300) above in-page
  sticky (`--z-sticky` 200). The grain/scanline film layer no longer exists.

## Chrome (fixed — not per-page rotatable)

- **Nav: N1b-register bar** — fixed height 56px, always solid, hairline below.
  Wordmark (logo + "Nanook" + brand-red square) left, the four links next to it
  (Docs · API · Blog · GitHub), theme toggle right. Built by CSS over the
  baked markup (`.header-right { display: contents }`); below 640px the
  compact bar + JS drawer from `js/theme.js` (hamburger injected — no HTML
  edits).
- **Footer**: logo + two link columns + copyright line, as baked into every
  page — restyled as a quiet index (sentence-case column heads, hairline
  above, generous padding). Ft3 is allowed because every page of this site is
  a docs root or hub.
- Theme toggle labels read **Light / Dark**; cookie banner sentence case;
  skip link (injected) is an ink block; `aria-current="page"` on the active
  nav link (ink + blue underline).
- **404** (`/404.html`): status line, display figure in brand red, three
  exits. `noindex`, not in the sitemap.

## Per-page allowances

- Landing page MAY carry the architecture figure (`img/arch.svg`, authored
  dark-first, CSS-inverted on light paper — same rule as blog diagrams) and
  the tabbed code sample. Nothing else is enrichment.
- Content pages (blog, docs, hubs, root pages): **typography only** — no
  enrichment, no reveals.
- Diagrams are authored for the dark theme and CSS-inverted for light
  (see AGENTS.md § Theme).

## CTA voice

- Primary: ink fill, paper text, radius-sm, 40px tall, Plex Sans 500,
  sentence case, a verb or a destination ("Quickstart", "Read the guide").
- Secondary: hairline outline (`--border-bright`), ink text, same geometry.
- Tertiary: plain text link with the blue underline.
- All three: hover shifts background one step, active translates 1px, focus
  ring instant, never animated in. Labels never wrap.

## What pages MUST share

Wordmark treatment · palette + accent discipline · both themes · the three
faces in their roles · spacing/motion/z tokens · focus-ring treatment · the
bar + footer · sentence-case labels.

## What pages MAY differ on

Macrostructure within the family table above · section rhythm · card density
(2-up on hubs, 3-up on the landing use cases) · whether a page has a lead
sentence under its title.

## Exports

This is a no-build static site; tokens are **not** duplicated into a separate
`tokens.css` (a second stylesheet nothing imports would drift). The canonical
export IS `css/nanook.css` § SCALES + § TOKENS. Tailwind/DTCG/shadcn export
formats are intentionally omitted — no consumer exists in this repo; generate
them on demand from the table above if ever needed.
