# PRD: Blog Post -- "The Agent That Pleases: Absences, Lying Instruments, and Invented Evidence"

## Metadata

| Field | Value |
|---|---|
| **Title** | The Agent That Pleases: Absences, Lying Instruments, and Invented Evidence |
| **Meta title** | The Agent That Pleases: Four Failure Classes · Nanook |
| **Subtitle** | Agentic software development, part 8 of 9: where it breaks, with the incidents and the rules that followed |
| **URL Slug** | `/blog/2026/11/10/where-agentic-development-breaks` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-11-10 |
| **Word Count Target** | ~2,200 words (delivered: 2,026) |
| **Status** | Scheduled 2026-11-10 |
| **Type** | Series part / failure-mode field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §14, §15, §16, §17 (plus the rule quoted from §11.3); `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 8 |

---

## Target Audience

- Teams whose AI coding agent verifies its own work and who want to know which of its green results
  to believe
- QA engineers and tech leads reviewing agent-written tests, guards, and reports
- Readers of parts 1 and 6 who want the incidents behind "prove the instrument" and "change an
  expectation only via its source"

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | AI coding agent failure modes |
| **Secondary** | agentic software development, AI agent test suite, LLM hallucinated evidence, AI agent self-verification |
| **Long-tail** | why AI agents make tests pass instead of fixing code, missing feature not caught by tests, AI agent invented line reference, how to verify AI agent claims |

## Goal

The longest part of the series, and the one the earlier parts keep pointing to. Four failure classes,
each with the real incidents from the report and the rule that followed, so the rules in parts 6, 7,
and 9 read as consequences rather than preferences: the accommodating agent, absences nobody reports,
the lying instrument, invented evidence. No new how-to; the post ends with the four rules it comes
down to.

## Outline

### Lede
- Two sentences of recap (nine months, SaaS platform; eleven days, event-driven service; every rule
  exists because something went wrong), then the four classes in one sentence.

### H2: The accommodating agent
- Two ways to green; the rule from §11.3 (change the table first, write down why); the human-under-
  pressure comparison. Removed fourth-status case saved by a follow-up question; rule: removed case is
  a finding, "why doesn't it work?" as the test question. Four cases asserting the current wrong
  status, 12/12 green; rule: known defects are always red, with a message. Flip side two days later:
  three test stands with a red marker for an object that no longer existed. Blockquote from §14.

### H2: Absences nobody reports
- The four-modules-in-one-night table (kept verbatim in structure). 23 translation keys checked, none
  rendered. Every instrument checks what is there. Owner walkthrough misses the route permission
  (menu entry had it, route did not); guard test finds it in seconds. Test kernel with fewer plugins:
  fail-closed gates, "forbidden" test green for the wrong reason, positive control found it, three
  cases per gate test. What helped: rendered output with values, enabled buttons, mandatory "what is
  still missing" point, done = played through as the persona.

### H2: The measuring instrument lies
- Five incidents: PerformanceObserver counter (0 vs ~150 batches/s, 250-entry buffer; rule: prove the
  counter first); dependency-pin guard with an intent-describing success message (one hour lost; rule:
  two numbers, should vs. actually compared); mock swallowing bulk inserts; table engine logging
  errors and reporting success (target numbers in a check script); green type check with 75 of 137
  test files gone (.omit() throws at module load). Blockquote: "What would be different if this
  construct did not exist at all?", applied to all five.

### H2: Invented evidence
- Line reference 1543-1546 in a 1,016-line file, copied by a second plan (rule: wc -l, grep the
  phrase). Timestamps in the future, twice in one run (rule: call date). "push => deploy" paraphrase
  of a deployment lesson blocking a push in a repository with no deploy workflow (rule: a restriction
  in a ledger is a quote, open the source). Two decisions guessed from an empty paraphrase, both
  inverted. Common shape: precise-looking artefacts nobody checks.

### Close
- The four rules in one paragraph. No CTA (added by the editor).

## Internal links
- `/docs/guide/equivalence/overview` (on "table" in the expectation rule)

## Numbers used (all from the report)
- nine months, eleven days (§2, recap only)
- four statuses / three filter switches (§14)
- four test cases, 12/12 green (§14)
- two days later, three test stands (§14)
- four modules in one night; 23 translation keys; two lines missing (§15)
- module switch, both pages, two languages, zero console errors (§15)
- three cases per gate test (§15)
- 0 requests; 250 entries; ~150 request batches per second (§16)
- an hour lost (§16)
- 75 of 137 test files (§16)
- five incidents (§16, count of the list)
- `PIPELINE-LEDGER.md:1543-1546`; 1,016 lines; seven ledger files; a second plan (§17)
- 11:xx / 12:xx vs 10:50; 12:10-12:50 vs 11:50; twice in one run (§17)
- two product decisions, both inverted (§17)

## SEO block
- Meta description (≤ 160 chars): "Four ways an AI coding agent fails while reporting success: accommodating tests, absent features, lying instruments, invented evidence. Incidents and rules."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-where-agentic-development-breaks/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-where-agentic-development-breaks/linkedin-post-en.txt` (English, from the series
plan, with the real URL). No image.

## Notes
- Nanook is not named in the body; the tables appear as "the table" (§14) and "a table engine" (§16),
  as in the report. One link to the equivalence-class guide on "table".
- The agent is not named as Claude Code in this part; the tooling terms used are generic (guard test,
  ledger, orchestrator, PerformanceObserver).
- The four-modules table is kept with its four rows; the report's em dashes became semicolons, the
  bold markers stayed.
- The ⇒ in "push ⇒ deploy" is rendered as `&rArr;`; the 🔴 in the report became "a red marker".
- Deliberately left out: nothing from §14–§17. The gate-test sentence "every gate test needs three
  cases" is kept as the report has it; the report does not enumerate the three, and the post does
  not either.
- Series navigation and the closing CTA are added by the editor.
