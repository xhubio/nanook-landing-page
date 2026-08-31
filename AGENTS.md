# AGENTS.md — AI Assistant Instructions for nanook-landing-page

> Companion to `CLAUDE.md`. That file describes **what the site is**; this one describes
> **how to work on it** — the steps, the traps, and the things that are measurably not
> what they look like.
>
> Everything below was measured on 2026-08-21, not assumed. Where a claim is a count, the
> command that produced it is given.

## The one thing to understand first

**This is Docusaurus v1 *output* with no Docusaurus.** There is no `package.json`, no
`docusaurus.config.js`, no `website/` — verified: none of them exist. 178 HTML files are
committed and served directly by GitHub Pages.

That means every consequence of a static-site generator is present, and none of its
conveniences:

| | Measured |
|---|---|
| Chrome (nav, header, footer) per page | ~40 % of each file |
| Files carrying the blog sidebar | **12** |
| Files carrying the docs sidebar | **150** |
| `.html` + `/index.html` twin pairs | **86** |

⇒ **A layout change is a 150-file edit.** Budget accordingly, or decline and say why.

🔴 **`CLAUDE.md` line 17 claims an `/en/` locale mirror. It does not exist.** Do not
follow that instruction; it is stale.

## Publishing a blog post

### 1 · The PRD is the planning artefact, not a gate

`prds/blog-<slug>.md` holds audience, keywords, outline, internal links, CTA, SEO block.
Measured reality:

- **8 PRDs, 2 published** — six are a content backlog, not work in progress.
- **4 published posts have no PRD**, including the most recent one
  (`ai-assisted-equivalence-class-tables`, 2026-03-29).

⚪ So: write a PRD when the post needs planning or review before drafting. Do **not**
treat a missing PRD as a blocker for an existing post, and do not retro-fit PRDs to
published posts unless asked.

### 2 · Building the HTML

There is no build. Copy the most recent post as a template and replace:

```
blog/2026/03/29/ai-assisted-equivalence-class-tables.html   ← current best template
```

- `<title>`, `meta[name=description]`, `og:title`, `og:description`, `og:url`
- the canonical/self links (`/blog/YYYY/MM/DD/<slug>` appears several times)
- `h1.postHeaderTitle` and `p.post-meta`
- the body between `<div><span>` and `</span></div>`

### 3 · 🔴 The six places a post must be registered

Missing one is the normal failure mode here — the last publish missed two.

| # | Where | Why it is easy to miss |
|---|---|---|
| 1 | `blog/YYYY/MM/DD/<slug>.html` | the post itself |
| 2 | `blog/YYYY/MM/DD/<slug>/index.html` | **byte-identical twin** for the clean URL |
| 3 | sidebar `<li class="navListItem">` in **12** files | the sidebar is baked into every blog page, including old ones |
| 4 | `blog/index.html` teaser | prepend a `div.post` block with an excerpt |
| 5 | `blog/feed.xml` + `blog/atom.xml` | see below — these are effectively dead |
| 6 | `sitemap.xml` | one `<url>` entry |

### 4 · What is currently broken, and is not your fault

Do not treat these as regressions you introduced:

- **The feeds are stale.** `feed.xml` carries **1** item for **5** posts;
  `lastBuildDate` is frozen at **2019-06-01**. Same for `atom.xml`.
- **The sitemap lags.** 4 blog entries for 5 posts — the newest is missing.
- **`inroducing.html` and `introducing.html` are byte-identical.** A typo'd duplicate from
  2019 that both still resolve. Leave it unless asked; deleting changes live URLs.

💡 These three are the same symptom: **generated artefacts kept by hand rot silently.**
Nobody notices, because nothing fails. If you publish a post, fixing the feed for that
post is cheap; a full feed rebuild is a separate decision.

### 5 · 🔴 Lektorat is mandatory — always, before pushing

After writing **or editing** a post, run the **`lektor` agent** (`.claude/agents/lektor.md`)
— proactively, without being asked. It cross-reads language and tone, checks facts and
links against the PRD, and verifies all six registration places (including byte-identical
twins). It is read-only: it reports findings; the main agent applies the fixes, then
re-runs the Lektor if anything 🔴 was found. There is no CI here — the Lektor pass is the
only gate between a draft and the live site.

## Content conventions

- **Language is English.** All posts and docs. (`CLAUDE.md` and `REDESIGN.md` are German
  — those are internal.)
- **Author block** links `https://cv.xhub.io/de/torsten.link`.
- **Tone**: technical and specific. The existing posts state numbers and admit limits.
  Keep the product out of the first half; introduce Nanook where it actually answers the
  problem, not in the lede.

### Theme

Two themes, both live: `data-theme="tactical"` (dark, the default, set on `<body>` in all
175 occurrences) and `swiss` (light). A toggle persists the choice in `localStorage`.

🔵 Diagrams are authored as Excalidraw JSON, rendered to PNG, and **inverted by CSS** in
light mode:

```css
body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }
```

⇒ Author diagrams **for the dark theme** (dark background, white text). The light variant
is derived, never drawn twice.

- Keep the `.excalidraw` source next to the PNG in `img/blog/` — both original diagrams do.
- ⚪ **Hand-maintained SVG is an accepted alternative** (since the 2026-08-21 post): the SVG
  *is* its own editable source, so no `.excalidraw` twin is required. Same palette, same
  dark-first rule, same CSS invert — it applies to `img` inside `.blog-diagram` either way.
- Palette: `#0A0A0A` background · `#E61919` invalid · `#4CAF50` valid · `#f59e0b` caution
  · `#ffffff` text · `roughness: 0` · `fontFamily: 3` (monospace).

### `llms.txt`

A 39-line machine-readable index of the docs at the site root. **If you add or move a
docs page, update it** — it is the one file whose whole purpose is to be read by an agent,
and it has no generator watching it.

## Common pitfalls

1. 🔴 **Do not put a new post straight into `blog/`.** Check `prds/` first — the post may
   already be specified there, with an agreed outline and keyword set. (This exact mistake
   happened on 2026-08-21: an article was built as HTML before anyone looked at `prds/`.)
2. 🔴 **The sidebar edit is site-wide, not per-post.** Editing only the new post leaves it
   unreachable from every other page.
3. **`css/main.css` is minified Docusaurus output, ~168 KB.** Targeted edits only; never
   reformat or regenerate it.
4. **Deployment is a push to `main`.** No CI, no tests, no preview. What you commit is
   live — so check the rendered file locally before pushing.
   🔴 **Nach jeder Änderung an `css/brutalist.css` oder `js/theme.js`:
   `tools/cache-bust.sh` ausführen** (schreibt einen Inhalts-Hash als `?v=` in alle
   HTML-Dateien; idempotent). Ohne den Bump überdeckt der Browser-Cache
   (GitHub Pages, max-age 600) den Deploy bis zu 10 Minuten — und beim lokalen
   Prüfen mit `python3 -m http.server` passiert dasselbe mit alten Stylesheets.
5. **The `.html` and `/index.html` twins must stay identical.** Editing one and not the
   other produces two different pages at two URLs that look like one.

## When to propose a generator instead

If a task requires touching the chrome, adding a docs section, or publishing more than one
post, say so plainly: the hand-maintained duplication is the cost driver, and a small
generator for `blog/` alone (Markdown → the six places above) would remove it without
touching `/docs`, which almost never changes.

⚪ That is a proposal, not a licence — do not start a migration without an explicit go.
