# PRD: Blog Post -- "The Agent Writes the Code. Everything Around It Decides Whether You Can Trust It."

## Metadata

| Field | Value |
|---|---|
| **Title** | The Agent Writes the Code. Everything Around It Decides Whether You Can Trust It. |
| **Meta title** | The Agent Writes the Code · Nanook |
| **Subtitle** | Agentic software development, part 1 of 9: the overview and the numbers |
| **URL Slug** | `/blog/2026/09/22/agentic-development-overview` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-09-22 |
| **Word Count Target** | ~1,300 words |
| **Status** | Published 2026-09-22 |
| **Type** | Series opener / field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §1, §2, §23; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 1 |

---

## Target Audience

- Teams that let an AI coding agent write most of their code and wonder what, besides speed, they
  are actually getting
- Engineering leads deciding what a human still has to own when an agent implements
- Readers of the earlier field reports (2026-08-21, 2026-08-29) who want the setup behind them

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | agentic software development |
| **Secondary** | AI coding agent, Claude Code workflow, AI agent software engineering, decision tables |
| **Long-tail** | how to trust code written by an AI agent, AI agent development process, coding agent failure modes |

## Goal

Open a nine-part series with one argument and its evidence: the agent writes the code, and what
makes that code trustworthy is the structure around the agent. The post gives the two settings with
their measured numbers, says what the series will and will not cover, and lists the ten sentences
of the short version as the series' table of contents. No how-to yet; every how-to belongs to a
later part.

## Outline

### Lede
- Speed is real and the least interesting part. Nine months, an agent writing nearly all code; the
  author designs, decides, reviews, contradicts, and decides which claims to believe.
- The thesis as a blockquote (verbatim from §1).

### H2: Two settings, one core
- Setting A: multi-product SaaS platform, five products on shared modules, since December 2025,
  measured 2026-09-17: 74 repositories, ~14,000 commits, 4,284 root commits, ~1,240 completed
  plans, 65 open, 327 lessons, 66 wiki articles from 122 sources, 24 active skills (14 archived),
  10 path-bound rule files. Each repository released on its own; a shared change travels through
  ten or more repositories.
- Setting B: event-driven service in a client project: 11 days, 12 designs on day one, 97 commits,
  8,053 source lines in 54 files, 9,183 test lines in 44 files, 806 tests (805 passing, 1 skipped),
  13 decision-table sheets (11 generating), 214 generated cases in 1,712 files, 100 % per sheet or
  the build fails.
- Why both belong in one report: the core (structure, order, gates, retained knowledge) is the same.
- Diagram: `img/blog/two-settings-one-core.svg`

### H2: What this series will and will not tell you
- Not a speed story, not a tool review. The "everything around": setup, process, tables, tests,
  automation, and at length the failures. Every rule exists because something went wrong at least
  once, usually more than once.

### H2: The short version, in ten sentences
- The ten sentences from §23, each with the part of the series that expands it. Sentence 2 links
  the equivalence-class guide.

### H2: The series
- Table of nine parts with working titles and what each covers; one part a week; rows get linked as
  parts appear.

### Close
- Role sentence; CTA: the tables in both settings are Nanook decision tables; field report
  2026-08-21 or the Quickstart.

## Internal links
- `/docs/guide/equivalence/overview`
- `/blog/2026/08/21/testing-a-saas-with-nanook`
- `/blog/2026/08/29/e-invoicing-decision-tables`
- `/docs/quickstart/quickstart`

## Numbers used (all from the report, measured 2026-09-17; re-measure or keep the date)
74 · ~14,000 · 4,284 · ~1,240 · 65 · 327 · 66 / 122 · 24 / 14 · 10 · 11 days · 12 designs · 97 ·
8,053 / 54 · 9,183 / 44 · 806 (805 / 1) · 13 / 11 · 214 / 1,712 · 100 % · since December 2025 ·
nine months · five products · ten or more repositories per shared change.

## SEO block
- Meta description (≤ 160 chars): "Agentic software development, measured: nine months, 74 repositories, an agent writing nearly all the code. Part 1 of a series on what makes it trustworthy."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## Series (status)

| # | Working title | Slug | Status |
|---|---|---|---|
| 1 | The agent writes the code. Everything around it decides whether you can trust it. | `agentic-development-overview` | published 2026-09-22 |
| 2 | Fewer skills, shorter rules | `agent-toolbox-and-instruction-file` | planned |
| 3 | One root, many repositories | `directory-layout-requirements-lifecycle` | planned |
| 4 | What the next session knows | `knowledge-base-and-lesson-memory` | planned |
| 5 | A table cannot stay silent | `requirements-into-decision-tables` | planned |
| 6 | Tests first, then "implement all plans" | `tests-first-red-chain` | planned |
| 7 | Working through 1,200 plans | `plan-pipeline-and-release-cascades` | planned |
| 8 | The agent that pleases | `where-agentic-development-breaks` | planned |
| 9 | Rules need exit codes, and green is not useful | `rules-need-exit-codes` | planned |

Part 1 is the series overview; later parts link back to it. When a part is published, link its row
in the series table of part 1 (+ twin).

## LinkedIn companion

Files: `prds/assets/linkedin-agentic-development-overview/linkedin-post.txt` (German, primary) and
`linkedin-post-en.txt` (English, from the series plan). No image in this pass; the blog diagram can be
exported to PNG (`qlmanage -t -s 1200`) if one is wanted.

## Notes
- Nanook appears twice: in sentence 2 of the short version (link to the guide) and in the closing
  CTA. Not in the lede (AGENTS.md tone rule).
- The report is first person; the post keeps it (author Torsten Link).
- Diagram: hand-maintained SVG, dark-first, CSS-inverted (AGENTS.md § Theme).
- Registration: the six places from AGENTS.md; the unpublished 2026-09-02 draft gets the sidebar
  line too, so it stays consistent with the other blog pages, but is not registered itself.
