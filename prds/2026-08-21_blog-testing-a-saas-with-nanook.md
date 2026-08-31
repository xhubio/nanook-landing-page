# PRD: Blog Post -- "How We Test a SaaS Application with Nanook"

## Metadata

| Field | Value |
|---|---|
| **Title** | How We Test a SaaS Application with Nanook |
| **Subtitle** | From 16 hand-written spec files to 1,981 table-driven cases |
| **URL Slug** | `/blog/2026/08/21/testing-a-saas-with-nanook` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-08-21 |
| **Word Count Target** | 1,800--2,400 words |
| **Status** | Draft PRD |
| **Type** | Field report / case study |

---

## Target Audience

- Teams with a growing E2E suite that is becoming the bottleneck rather than the safety net
- QA engineers who know equivalence class tables but have never connected them to test *execution*
- Engineering leads deciding whether to keep writing spec files or change the approach
- Anyone who has a page-object layer and suspects it has stopped paying for itself

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | data driven testing |
| **Secondary** | decision table testing, test case design, playwright data driven, equivalence class tables in practice, page object alternative |
| **Long-tail** | how to make e2e tests data driven, decision tables for test automation, reduce test maintenance effort, spec files vs data driven tests |

## Goal & Success Metrics

**Goal:** Show Nanook in real use rather than in principle. This is a field report: what our test
base looked like before, what we changed, what it cost, and what it caught. It is bottom-of-funnel
for readers who already believe in structured test design and want to see it carried through to a
running suite -- and top-of-funnel for readers who have never linked "equivalence class table" with
"this is what actually runs in CI".

**Success Metrics:**
- Organic traffic for "data driven testing" / "decision table testing" within 90 days
- CTR to Quickstart >= 5% of blog post visitors
- Time on page > 4 min (long-form field report)
- Referrals from the companion LinkedIn post

---

## Outline

### H2: The Suite That Stopped Paying for Itself

- We build SaaS products (invoicing, trades/field-service). The E2E suite grew the way they do:
  one spec file per screen, then per feature, then per bug
- Measured before the change: **55 page classes, 703 element getters -- and exactly 2 functions
  with a data contract**
- The consequence in one sentence: *how you operate a Radix select was written down up to 55 times*
- Frame the real problem, which is not volume: **the specification lived in TypeScript.** A
  `const CASES = [...]` in a `.spec.ts` belongs to whoever writes TypeScript, not to whoever knows
  the domain

### H2: What We Changed

#### H3: The table is the source, not a generator input
- Nanook already produced spec files from tables. That was the expensive part: after generation,
  a file lay around per surface and wanted maintaining
- We inverted it: **the table stays the source, and one runner reads suite descriptions as data**
- Result: `<app>/tests/suiten.spec.ts` -- *one* file, not one per surface

#### H3: Three commitments that carry the approach
1. **The suite JSON knows no Playwright vocabulary.** It describes cases, not clicks -- readable by
   someone who knows the domain and not the tooling
2. 🔴 **The expectation belongs at the boundary where it holds** -- `ui` or `api`. Of 41 company
   cases, **26 were pure statements about a validation schema**. Against the procedure they run in
   seconds; through the browser the same case costs 20--60 s. *A test that pushes a schema statement
   through a browser does not measure more, it measures slower*
3. **A report that names the table column.** A failure says test case, **column**, page and field --
   otherwise the red run leads straight back into the handwork the runner just abolished

### H2: The Shape of a Table

- Show a real table skeleton: `Secondary data` (what must already exist) above `Primary data`
  (what the test enters), then `Expected reaction` and `Expected effect`
- Explain the markers as Nanook defines them (🔴 corrected 2026-08-30, Torsten): `x` chooses exactly this
  class; `a` is the preferred class among several and is generated; `e` marks the other valid classes so
  they count for coverage (CASCADE). `e` does **not** mean "must not happen" — a negative expectation is
  its own row with an `x` (`no conflict on the board`)
- 🔵 **The fifth case is the counter-probe, not decoration.** Four cases demand "conflict findable", one
  demands "no conflict". A probe that always reports conflict fails the fifth; one that never
  reports fails the four. **The contradiction between two cases is what turns a value into an
  assertion**

#### H3: Preconditions are an axis, not a path
- "First create an appointment, then book over it" reads like a scenario. It is not
- A pre-existing state is an **axis** -- and as an axis it crosses with every other class
- The payoff case: a *proposal* over an existing booking, which must **not** report a conflict
  while a real booking must. Nobody writes that as a script, because it only occurs to you when you
  see the grid

### H2: Where It Stands Now

| | Before | Now |
|---|---|---|
| Hand-written domain spec files | 16 | **0** |
| Decision tables | -- | **117** |
| Test cases | -- | **1,981** |
| Runner files per app | one per surface | **8 total**, all generic |

- Two products: an invoicing API and a field-service SaaS
- Plus 24 flow sheets for the cases where order genuinely is the statement
- One module -- a dispatch board with 43 procedures and 84 call sites in the UI -- had **no tests at
  all**. It now has 92 cases in six tables, built in a single session

### H2: What It Caught

- Frame honestly: the point of the switch was maintenance, and the defects were a side effect --
  which is exactly why they are worth reporting

#### H3: The one that had been green for two days
- Code block: a sort assertion whose field reader had been renamed, comparing `[undefined, ...]`
  against `[undefined, ...]`
- **A dead reader does not make an assertion fail. It makes it empty -- and empty looks exactly like
  correct.** Behind it: sorting ascending returned descending
- Why the table-driven runner surfaced it in minutes: the same reader serves twenty other cases that
  *do* have values

#### H3: The class of defect tables find on their own
- Missing `.trim()` before `.min()` -- five separate locations, because every table asks the same
  question of every text field
- A whole module answering rule violations with `500` instead of `4xx` -- one wrapper, 41 procedures
- 🔵 The pattern: **a table asks the boring questions everywhere, and boring questions are the ones
  humans skip**

### H2: Two Mistakes We Made

- This section is deliberate. A field report without them is a brochure

#### H3: An equation whose two sides come from the same number
- The stock-balance assertion, first version: `base = stockAt - sum(movements)`, then "is base a
  non-negative integer?" -- green, and unable to find the defect its own case was named after
- Fix: read the base quantity independently. **Only then was a mutation probe possible at all**

#### H3: An optional field switched off the compiler
- A shared contract had `ariaSort?: string | null`. Three of four page modules never set it -- while
  their probe read it. `undefined === 'ascending'` is always false, so the check passed **empty**
- Made it mandatory: the type checker named a third module immediately, and the same run went from
  15 to 20 red -- the five new ones being exactly those that had measured nothing

### H2: Verify the Verifier

- Every new assertion gets a mutation probe: break it on purpose and check **which** cases fall, not
  merely *that* some do
- Table: four probes, predicted vs measured (3 / 3 / 1 / 4 -- each exact)
- 🔴 Always over a file copy, never `git checkout`

### H2: What Tables Do Not Solve

- **Order-as-the-statement stays a flow.** "Finalize, then confirm it can no longer be edited" is a
  chain; the sequence *is* the assertion. We keep 24 flow sheets for exactly this
- **A table freezes what it describes.** Pouring a half-built module into cases pins down a state
  that is still meant to change -- every change then produces red that is not a defect
- **The runner still needs a domain probe.** The table says what must happen; something has to know
  how to look. That part is code, and it must observe and report -- never assert. A probe with its
  own `expect` pulls the expectation out of the table and into the place where nobody reads it

### H2: Would We Do It Again

- Short, concrete close. The honest summary: the win was not fewer tests, it was **the
  specification moving out of TypeScript** -- and the maintenance curve flattening as a result
- Point at the docs for the reader who wants to start

---

## Nachtrag 2026-08-31 (Torsten)

Zwei Abschnitte nach "The Shape of a Table" ergaenzt: (1) **"Where the Values Come From"** — die
Generator-Spalte an EINER Testfall-Spalte (static / `gen:` mit Instanz-Id / `ref:` als Bruecke
zwischen Tabellen, Custom-Generator via Login-Post); (2) **"A Flow Table Ties the Tables Together"**
— reale Flow-Tabelle `KundeRundweg` (`<fn:>`, Datenspalte, `<pc:kunde>`, `<mode:check>` als
Rueckleseprobe; TC2 = abgewiesener Fall hat nichts zurueckzulesen).

## Internal Links to Include

| Link Text | URL |
|---|---|
| Quickstart guide | `/docs/quickstart/quickstart` |
| Equivalence class guide | `/docs/guide/equivalence/overview` |
| Create an equivalence class table | `/docs/tutorials/createEquivalenceClassTable` |
| Matrix tables | `/docs/guide/matrix/overview` |
| Cross-table references | `/docs/guide/generatrorCommand/reference` |
| Custom generators | `/docs/tutorials/createGenerator` |
| AI-Assisted Equivalence Class Tables | `/blog/2026/03/29/ai-assisted-equivalence-class-tables` |
| Manual vs. Automated | `/blog/2026/03/20/test-data-manual-vs-automated` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |

## Call to Action

Primary CTA:
> **Your suite is probably already a table -- it is just written in TypeScript.** Start with the
> [Quickstart](/docs/quickstart/quickstart) and turn one screen into an equivalence class table;
> the [tutorial](/docs/tutorials/createEquivalenceClassTable) walks through the markers.

## Technical Requirements

- **Tables:** three. (1) Before/Now comparison -- the centrepiece, must be scannable. (2) The table
  skeleton (`Secondary data` / `Primary data` / expectations) as a **monospace block**, not an HTML
  table: the `x` / `.` alignment carries the meaning. (3) The mutation-probe table as a normal HTML
  table.
- **Code examples:** three short blocks, each carrying exactly one sentence -- the dead-reader sort
  assertion (2 lines), the self-referential balance check (1 line), the optional-field contract
  line (1 line). Nothing longer.
- **Numbers:** every figure is measured. Do not round or embellish. If a number cannot be
  re-derived at publish time, drop the sentence rather than adjust the number.

### Diagrams (Excalidraw -> PNG)

**Diagram 1 (TO CREATE):** "One runner instead of one spec per surface"
- File: `/img/blog/one-runner-vs-spec-per-surface.png` + `.excalidraw`
- Content: left -- N table icons each feeding its own generated `.spec.ts`, each spec then needing
  maintenance (caution orange, with a small "maintain" loop on every file); right -- N tables all
  feeding **one** runner box (green), with the tables labelled "the source"
- Placed after H3 "The table is the source, not a generator input"

**Diagram 2 (TO CREATE):** "Path vs. Axis"
- File: `/img/blog/precondition-path-vs-axis.png` + `.excalidraw`
- Content: left -- three separate scenario arrows, each a straight line setup -> act -> assert
  (caution orange); right -- a 2x2 grid where preconditions form one dimension and input classes the
  other, fourth cell highlighted green and labelled "the case nobody writes"
- Placed inside H3 "Preconditions are an axis, not a path"

**Style rules:** dark background (`#0A0A0A`), `#E61919` invalid, `#4CAF50` valid, `#f59e0b`
caution, `#ffffff` text, `roughness: 0`, `fontFamily: 3` (monospace). Author for the dark theme --
the light variant is derived by CSS (`body[data-theme="swiss"] .blog-diagram { filter: invert(1)
hue-rotate(180deg); }`). Keep the `.excalidraw` source next to the PNG.

## SEO Notes

| Element | Value |
|---|---|
| **Meta title** | How We Test a SaaS Application with Nanook -- Nanook |
| **Meta description** | A field report: how we replaced 16 hand-written spec files with 117 decision tables and 1,981 data-driven cases, what it caught, and the two assertions we got wrong ourselves. |
| **og:title** | How We Test a SaaS Application with Nanook |
| **og:description** | From one spec file per screen to one runner reading tables as data -- with the numbers, the defects it surfaced, and what decision tables do not solve. |
| **og:image** | `/img/social-card.png` |
| **Schema.org type** | `Article` |
| **URL** | `https://nanook.xhub.io/blog/2026/08/21/testing-a-saas-with-nanook` |

## Notes

- **This is a field report, not an announcement.** The credibility comes from three things:
  measured before/after numbers, two admitted mistakes of our own, and a section on what the
  approach does *not* solve. Cutting any of the three turns it into marketing.
- **The strongest single argument is not the case count.** It is that the specification moved out
  of TypeScript. Lead the "What We Changed" section with that, not with the tooling.
- **Keep the products unnamed** — ⚪ gelockert 2026-08-31 (Torsten): **dasHandwerk wird beim ersten
  Auftreten genannt und verlinkt** (https://dashandwerk.xhub.io); die invoicing API bleibt unbenannt.
- **Introduce Nanook where it answers the problem**, not in the lede. The first section holds up
  as a general argument about test suites.
- **Publish checklist:** this post must be registered in six places, not one. See `AGENTS.md`,
  section "The six places a post must be registered" -- the previous publish missed two of them
  (`sitemap.xml` and both feeds).
- **Companion LinkedIn post:** `prds/2026-08-21_linkedin-testing-a-saas-with-nanook.md`. Publish after the
  blog post is live, since it links to it.
- Template of record: `/blog/2026/03/29/ai-assisted-equivalence-class-tables.html`.
