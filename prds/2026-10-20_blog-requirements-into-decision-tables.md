# PRD: Blog Post -- "A Table Cannot Stay Silent: Finding Contradictions in Requirements Before Any Code Exists"

## Metadata

| Field | Value |
|---|---|
| **Title** | A Table Cannot Stay Silent: Finding Contradictions in Requirements Before Any Code Exists |
| **Meta title** | A Table Cannot Stay Silent · Nanook |
| **Subtitle** | Agentic software development, part 5 of 9: forcing requirements into decision tables |
| **URL Slug** | `/blog/2026/10/20/requirements-into-decision-tables` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-10-20 |
| **Word Count Target** | ~1,600 words |
| **Status** | Scheduled 2026-10-20 |
| **Type** | Series part / field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §8, §9 (recap figures from §2); `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 5 |

---

## Target Audience

- Developers and testers who receive a written specification and want to know what it does not say
  before implementing it
- Teams using an AI agent to analyse requirements and wondering why a perfect summary still misses
  contradictions
- Readers of the e-invoicing and SaaS field reports who want the requirements-side use of the tables

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | requirements into decision tables |
| **Secondary** | equivalence class tables, matrix table state event, requirements contradictions, specification as test oracle, AI agent requirements analysis |
| **Long-tail** | find contradictions in a specification before coding, decision table vs state matrix, test derived from specification not from code |

## Goal

Show that translating a specification into decision tables and matrix tables, with the agent doing
the translation, finds defects in the requirement that reading prose does not, and give the evidence:
the eight findings in the event-driven service before any code existed. Distinguish project work
(specification as oracle) from open product work (requirements developed first). Introduce Nanook in
the second section, where the table form answers the problem, and close with the three table rules
from the SaaS platform.

## Outline

### Lede
- Recap of the two settings (SaaS platform, own requirements; event-driven service, 11 days, 806
  tests, requirements from outside). The difference is in the first phase.

### H2: Requirements from outside, or requirements to be developed
- Project work: message schemas, API specs, existing systems; the specification is the oracle; tests
  before code. Product work: analyses of domain, legal requirements, user behaviour; risk is
  plausible features nobody needs (later part). Rest of the process is the same.

### H2: The first step: analyse the specification, then translate it into tables
- Agent analyses and translates into equivalence-class tables with the Nanook skill (link). Nanook
  as table engine (Excel workbook, generated cases). Decision table (what something is; classes;
  coverage percentage; link to equivalence guide) versus matrix table (what something becomes;
  states x events; link to matrix guide). 13 sheets, 11 generating.

### H2: Why a table finds what prose hides
- Three demands: classes, rows, results. Blockquote (prose does not lie, it stays silent). 40-page
  specification, page 12 and page 31; race conditions and unthought combinations.

### H2: Eight things the tables found before any code existed
- Twelve designs on day one. Ordered list with `<strong>` leads: contradiction between artefacts;
  seven ineffective filters (set / empty / multiple); combination with no answer (priority 0
  without feeder); fourth cancellation case as own state (three events); 50 rows vs `LIMIT 20`;
  misnamed "deadline expired" event; two columns demanded by cells; ignore vs error. Four of the
  eight from the matrix. Not a test artefact but a verification tool; about a day.

### H2: Three rules from the SaaS platform
- E2E tests as decision tables read by one shared runner; e-invoicing tables from pinned
  specifications (links to the two field reports). Rules: table is the point of truth, never
  overwritten automatically; test derived from the specification, not from `src/`; a removed case
  becomes a finding.

### Close
- Rule: force the requirement into a form that cannot stay silent before any code exists; every
  unfillable cell is a question for the specification's authors. No CTA in the body.

## Internal links
- `/docs/guide/equivalence/overview`
- `/docs/guide/matrix/overview`
- `/blog/2026/08/21/testing-a-saas-with-nanook`
- `/blog/2026/08/29/e-invoicing-decision-tables`

## External links
- `https://github.com/xhubio/nanook-skill` (as in the report)

## Numbers used (all from the report, measured 2026-09-17; re-measure or keep the date)
- eleven days, 806 tests (recap, §2)
- 13 decision-table sheets, 11 generating cases (§2)
- 40-page specification, page 12 and page 31 (§9.2)
- twelve designs, written on day one (§9.3, day-one detail from §2)
- eight findings; seven filter criteria; priority 0; fourth cancellation case reacting to three
  events; 50 rows per page vs `LIMIT 20`; two database columns (§9.3)
- about a day for the tables (§9.3)
- three rules (§9.4)
- "four of the eight came out of the matrix" is a count over findings 4, 6, 7, 8 as the report
  describes them

## SEO block
- Meta description (≤ 160 chars): "Prose stays silent where the work is; a table cannot. How translating a specification into decision tables found eight defects before any code existed."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-requirements-into-decision-tables/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-requirements-into-decision-tables/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL). To be moved to `prds/assets/linkedin-requirements-into-decision-tables/`
as `linkedin-post.txt` and `linkedin-post-en.txt` at publication. No image.

## Notes
- Nanook first appears in the second H2 (the Nanook skill and the table engine), not in the lede
  (AGENTS.md tone rule). It appears again in the SaaS section via the two field-report links.
- Claude Code is not named in the body; "the agent" carries it.
- The series plan suggests a part 5b (translated field report on the event-driven service) directly
  after this part; not linked here because it is not yet translated.
- Section 8's forward reference to "built correctly, and pointless" is phrased as "a failure mode
  that gets its own part later in this series" (part 9), without naming the part.
- The report is first person; the post keeps it (author Torsten Link).
- Registration: the six places from AGENTS.md; link the row in the part 1 series table (+ twin).
