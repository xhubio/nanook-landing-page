# LinkedIn Post -- companion to "How We Test a SaaS Application with Nanook"

| Field | Value |
|---|---|
| **Links to** | `https://nanook.xhub.io/blog/2026/08/21/testing-a-saas-with-nanook` |
| **Publish** | **after** the blog post is live |
| **Author** | Torsten Link |
| **Length** | ~160 words (fits above the "see more" fold on desktop) |
| **Purpose** | Short overview + pointer to the field report. Not a standalone argument |
| **Status** | Draft |

---

## Draft A — the before/after (recommended)

> Our E2E suite had 55 page classes and 703 element getters — and exactly **two** functions with a
> data contract.
>
> Which meant: how you operate a dropdown was written down up to 55 times. But that was not the
> real problem. The real problem was that the specification lived in TypeScript — and a
> `const CASES = [...]` inside a spec file belongs to whoever writes TypeScript, not to whoever
> knows the domain.
>
> So we turned it around. The decision table stays the source; **one runner** reads the suites as
> data.
>
> Where we are now, across two products:
>
> • 16 hand-written spec files → **0**
> • **117** decision tables, **1,981** cases
> • one module that had *no* tests at all → 92 cases in six tables, in a single session
>
> It also caught things. The most instructive one had been green for two days: a sort assertion
> whose field reader had been renamed, comparing `[undefined, …]` against `[undefined, …]`. A dead
> reader doesn't make an assertion fail — it makes it **empty**, and empty looks exactly like
> correct.
>
> Full field report, including the two assertions we got wrong ourselves and what tables *don't*
> solve:
>
> 👉 [link]
>
> #softwaretesting #testautomation #qa #testdesign #playwright

---

## Draft B — the one-sentence thesis

> Your test suite is already a decision table. It's just written in TypeScript.
>
> That was the realisation behind rebuilding how we test two SaaS products. Not "we need more
> tests" — but that the **specification** was sitting in spec files, where only developers could
> reach it, in the form of `const CASES = [...]`.
>
> We moved it out. The table is the source; one runner reads the suites as data. No generated spec
> files to maintain afterwards.
>
> • 16 hand-written spec files → **0**
> • **117** tables, **1,981** cases, across two products
> • Expectations placed at the boundary where they hold: of 41 cases for one form, **26 were pure
>   statements about a validation schema** — seconds against the API, 20–60 s each through a browser
>
> The write-up includes the numbers, the defects it surfaced, two mistakes we made ourselves, and a
> section on what decision tables do *not* solve — because a field report without that is a
> brochure.
>
> 👉 [link]
>
> #softwaretesting #testautomation #qa #testdesign

---

## Visual assets

Both live in `prds/assets/`. Neither needs a design tool — one is SVG, one is HTML that
prints to PDF.

### Option 1 — single image (recommended for a first post)

| | |
|---|---|
| Source | `assets/linkedin-single-testing-a-saas-with-nanook.svg` |
| Rendered | `assets/linkedin-single-testing-a-saas-with-nanook.png` — 1200×1200 |
| Re-render | `qlmanage -t -s 1200 -o . <file>.svg` (macOS, no toolchain needed) |

🔵 **Square, not 1200×628.** A 1:1 image fills the mobile feed, where most of the reach is.
The link preview keeps its own thumbnail regardless.

**What it shows:** the three figures (55 / 703 / **2** — the last in red, because it is the
statement), the headline *"Volume was not the problem"*, the reason in two lines, and a
BEFORE/NOW block with 16→0, —→117, —→1,981.

### Option 2 — carousel, 6 slides

| | |
|---|---|
| **Ready to upload** | `assets/linkedin-carousel-testing-a-saas-with-nanook.pdf` — 6 pages, 810×810 pt |
| Source | `assets/linkedin-carousel-testing-a-saas-with-nanook.html` |
| Re-export after an edit | see below — one command, no browser |

```bash
# from repo/tools/playwright (Chromium ships with Playwright)
node - <<'JS'
import { chromium } from '@playwright/test'
const DIR = '<abs path>/prds/assets'
const b = await chromium.launch(); const p = await b.newPage()
await p.goto(`file://${DIR}/linkedin-carousel-testing-a-saas-with-nanook.html`, { waitUntil: 'networkidle' })
await p.pdf({ path: `${DIR}/linkedin-carousel-testing-a-saas-with-nanook.pdf`,
  width: '1080px', height: '1080px', printBackground: true, preferCSSPageSize: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' } })
await b.close()
JS
```

🔴 **`printBackground: true` is not optional** — without it the slides come out white. The
same trap applies to the manual route (Print → margins **None**, "Background graphics" **on**).

⚪ The script must run from inside a tree that can resolve `@playwright/test`; from `/tmp` it
fails with `ERR_MODULE_NOT_FOUND`.

Slide order: 01 the hook (703 getters) · 02 the real problem (spec in TypeScript) · 03 the
switch · 04 precondition as an axis (the grid) · 05 the defect that was green for two days ·
06 numbers + pointer.

⚪ Slide 04 is the one that earns the post. It shows three scenario arrows on the left and a
2×2 grid on the right, with the *proposal over an existing booking* cell marked — the case
nobody writes as a script.

### Description for an image generator (if a different look is wanted)

> A 1:1 technical poster on a near-black background (#0A0A0A), industrial-brutalist style,
> monospace type throughout, no photography, no people, no gradients, no rounded corners.
> A thin red (#E61919) rule across the very top edge. Upper third: three very large numerals
> set side by side — "55" and "703" in grey, "2" in red — each with a small grey caption
> beneath. A hairline divider. Middle: a short bold white headline in two lines. Lower third:
> a dark panel (#121212) with a green (#4CAF50) vertical bar on its left edge, containing a
> small two-column comparison of numbers. Generous margins, strict left alignment, everything
> on a grid. Flat, printed, engineered — not glossy.

🔴 **Do not let a generator invent the numbers.** If you use one, produce the layout and set
the figures afterwards, or it will confidently render "1,984".

## Notes

- 🔵 **Draft A is recommended**: the 55/703/2 figure is concrete and lands immediately, and the
  green-for-two-days story gives people a reason to click. Draft B is sharper but more abstract —
  better if the audience already knows table-based design.
- **Both are overviews, not arguments.** The job is to point at the article, so neither should try
  to prove the case on its own. If a draft grows past ~200 words, cut rather than continue.
- **Keep the products unnamed** — "two SaaS products" is enough.
- **The numbers are measured**; do not round them for effect. Re-derive before posting if time has
  passed.
- LinkedIn strips code formatting: keep the inline `[undefined, …]` as plain text and check the
  paste before posting.
- Optional image: reuse Diagram 1 from the blog post
  (`/img/blog/one-runner-vs-spec-per-surface.png`) — it carries the before/after on its own.
