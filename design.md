# Design — Nanook Landing Page

A locked design system for this site. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow. (Hallmark multi-page contract: on this project,
**consistency wins over variety** — pages share the system; diversification is
inverted.)

Working rules for the repo itself (registration points, twins, deployment traps)
live in `AGENTS.md`. This file covers the visual system only.

## Genre

editorial — the site's voice is *Industrial Brutalist*: hard rules, mono labels,
telemetry framing on the landing page; the blog runs the same system in a calmer,
broadsheet register.

## Macrostructure families

- **Landing page** (`/index.html`): existing hand-built brutalist page
  (hero + diagram + features + use cases + FAQ + trust). Locked as-is; not part
  of any rotation.
- **Content — blog index** (`/blog/`): **Index-First**. The page is the archive:
  label + one factual sentence, then dated rows with hairlines. No hero, no
  display type at the top, no self-duplicating sidebar.
- **Content — blog posts** (`/blog/YYYY/MM/DD/<slug>`): **Long Document**.
  Single readable column (measure `--measure`), the article leads; related-posts
  index sits *after* the article, open, untoggled. No reveals.
- **Docs** (`/docs/**`): existing Docusaurus shell, themed via overrides.
  Locked as-is.

## Theme

The house palette. Dual theme on `body[data-theme="tactical" | "swiss"]`,
anchor hue **28** (warm red). All values OKLCH; neutrals carry the anchor hue at
low chroma (0.006–0.014). Canonical definitions live in
`css/brutalist.css` § CUSTOM PROPERTIES — that file is the single source of
truth; this table is the human summary.

| Token | tactical (dark) | swiss (light) |
| --- | --- | --- |
| `--bg-primary` | oklch(14.5% 0.008 28) | oklch(96.6% 0.006 28) |
| `--bg-secondary` | oklch(18.2% 0.009 28) | oklch(93.1% 0.008 28) |
| `--bg-elevated` | oklch(21.8% 0.010 28) | oklch(99.0% 0.004 28) |
| `--fg-primary` | oklch(93.7% 0.006 28) | oklch(11.5% 0.006 28) |
| `--fg-secondary` | oklch(68.6% 0.008 28) | oklch(38.7% 0.008 28) |
| `--fg-dim` | oklch(63.3% 0.008 28) | oklch(50.0% 0.010 28) |
| `--accent-red` | oklch(58.8% 0.231 28.3) | same |
| `--link-accent` | oklch(64.3% 0.243 27.6) | oklch(53.7% 0.211 28.3) |
| `--accent-ink` | oklch(99.0% 0.004 28) | same |
| `--border-color` | oklch(28.5% 0.012 28) | oklch(82.4% 0.012 28) |
| `--focus-ring` | = `--link-accent` | = `--link-accent` |

Accent discipline: red is for interaction (links, hover, active nav, focus) and
small marks — never large text blocks, never fills beyond a few percent of the
viewport. Contrast floor: WCAG 4.5:1 body / 3:1 large, verified in **both**
themes on every change.

## Typography

- **Display**: Inter 800/900 — locked by explicit user decision (2026-08-31).
  A swap to a non-default display face remains an *open user decision*; do not
  swap silently.
- **Body (apparatus)**: JetBrains Mono 400/700 — labels, dates, meta, tables,
  code, the blog index, the further-reading strip, and all docs/landing copy.
  The mono voice is the site's signature; it is no longer the *prose* face.
- **Reading (article prose)**: IBM Plex Sans 400/600 + italic 400 at 17px
  (`--font-reading`/`--text-reading`, lede `--text-lede` 19px), line-height
  1.7 — user decision 2026-08-31 ("redesign, so dass es lesbar ist"). Scope:
  `.lonePost` (blog articles) and `.docsContainer` (docs prose — extension
  requested by the user the same day) p/li/blockquote.
- 2+1 rule: this site now runs 2 + 1 (Inter display · Plex Sans reading ·
  JetBrains Mono apparatus). Loaded via `@import` at the top of
  `css/brutalist.css`, weights capped at 400/600/ital-400.
- Prose measure: `--measure` (68ch) on running text only; tables, code and
  figures may take the full column (deliberate asymmetry).
- Headings roman, never italic. Labels: mono, uppercase, letter-spacing 0.08em+,
  **floor 12px (`--text-xs`) on every viewport** — resolved 2026-08-31 (was
  desktop-only open); toggle/footer/cookie labels now sit on the floor.
- Open user decision: footer bracket voice (`[ MORE ]`) vs the plain masthead
  nav — unify only on the user's word.
- Type scale tokens `--text-*` (1.25 ratio) in `css/brutalist.css` § SCALES.

## Spacing · motion · layers

- 4-pt named scale `--space-3xs … --space-3xl` (+ `-sm2/-md2/-lg2` legacy 4-pt
  steps). Named tokens only; no raw values in new code.
- Easings `--ease-out / --ease-in / --ease-in-out`; durations
  `--dur-short/-mid/-long`. Motion stance: **motion-cut** — entrance animation
  exists only on the landing hero, everything else is just there.
  `prefers-reduced-motion` collapses all of it.
- z-scale `--z-base … --z-film`; nav (`--z-sticky-nav` 300) always above
  in-page sticky (`--z-sticky` 200).

## Chrome (fixed — not per-page rotatable)

- **Nav: N6 masthead** ≥ 641px (wordmark + 2px rule + link row, sticky,
  `--header-h`); compact bar + JS drawer below (injected by `js/theme.js` —
  no HTML edits, markup is baked into all 178 pages).
- **Footer**: link columns + copyright line — kept by explicit user decision
  (2026-08-31). The editorial default would be Ft1/Ft4; changing it is an open
  user decision, not a per-build pick.
- Cookie banner, theme toggle (CRT/INK), CRT grain film: as built.
- **Skip link** (`.skip-link`, injected by `js/theme.js`): first focusable
  element on every page, accent-red block, visible only on keyboard focus.
- **Current-page marker**: `js/theme.js` sets `aria-current="page"` on the
  masthead link for the active section (blog / docs / api); styled ink +
  red underline.
- **404** (`/404.html`): telemetry status line, display figure, three exits
  (start page / quickstart / blog). `noindex`, no canonical, not in the sitemap.

## Per-page allowances

- Landing page MAY keep its diagram enrichment + hero animations.
- Content pages (blog, docs): **typography only** — no enrichment, no reveals.
- Diagrams are authored for the dark theme and CSS-inverted for light
  (see AGENTS.md § Theme).

## What pages MUST share

Wordmark treatment · palette + accent discipline · both themes · the two font
families · spacing/motion/z tokens · focus-ring treatment · masthead + footer.

## What pages MAY differ on

Macrostructure within the family table above · section rhythm · rule weight
(hairline vs double rules) · label density (the landing page is loud, the blog
is calm — both are the system).

## Exports

This is a no-build static site; tokens are **not** duplicated into a separate
`tokens.css` (a second stylesheet nothing imports would drift). The canonical
export IS `css/brutalist.css` § SCALES + § CUSTOM PROPERTIES. Tailwind/DTCG/
shadcn export formats are intentionally omitted — no consumer exists in this
repo; generate them on demand from the table above if ever needed.
