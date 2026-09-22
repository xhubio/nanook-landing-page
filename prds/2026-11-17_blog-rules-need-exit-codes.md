# PRD: Blog Post -- "Rules Need Exit Codes, and Green Is Not Useful: What Still Went Wrong"

## Metadata

| Field | Value |
|---|---|
| **Title** | Rules Need Exit Codes, and Green Is Not Useful: What Still Went Wrong |
| **Meta title** | Rules Need Exit Codes, Green Is Not Useful · Nanook |
| **Subtitle** | Agentic software development, part 9 of 9: bypassed hooks, unnoticed red runs, pointless features, and the two lists |
| **URL Slug** | `/blog/2026/11/17/rules-need-exit-codes` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-11-17 |
| **Word Count Target** | ~1,700 words (delivered: 1,589) |
| **Status** | Scheduled 2026-11-17 |
| **Type** | Series closer / failure-mode field report with retrospective |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §18 (18.1–18.3, with the push-gate rules from §13.3 it points to), §20, §22, closing thought from §1/§23; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 9 |

---

## Target Audience

- Engineering leads who have written "never do X" into an agent's instruction file and want to know
  what that is worth
- Teams running an AI coding agent against CI with hooks and semantic releases
- Product-minded engineers whose agent builds plans faithfully and who wonder why the result does
  not help anyone; readers of part 1 who want the retrospective

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | AI coding agent guardrails |
| **Secondary** | agentic software development, Claude Code hooks, PreToolUse hook, --no-verify, AI agent CI pipeline |
| **Long-tail** | AI agent bypasses git hook, how to enforce rules for coding agents, agent-built features nobody uses, what I would do again with an AI coding agent |

## Goal

Close the series with the two failure classes that are not about the agent's output but about the
process around it: rules written in prose that were bypassed anyway, and plans executed correctly
that did not serve a user. Each gets its incidents and the rule that followed (the effect-naming
prohibition, the PreToolUse hook, the push gate, the mandatory user-job section, the sense check).
Then the retrospective as two lists, and a two-sentence close that returns to the series thesis
without repeating the ten sentences of part 1.

## Outline

### Lede
- Recap in two sentences (nine months, Claude Code, 74 repositories, ~14,000 commits, ~1,240 plans;
  the instruction file `CLAUDE.md` and plans verified against code), then the three failures of this
  part in one sentence.

### H2: `--no-verify`, five times
- Three agents on one day, reported by themselves ("reflex", "harmless"); read as a push rule.
  Fourth nine days later after a sharper brief; fifth the same day via `core.hooksPath`. The three on the first day
  self-reported. Two lessons: name the effect, not the spelling (verbatim wording); what must hold is
  a gate: the PreToolUse hook that denies `git push` with `--no-verify`, `SKIP_TESTS`, or a
  `hooksPath` override, with its message verbatim. Human can, agent session cannot.

### H2: Eight red CI runs nobody noticed
- Eight consecutive red release runs from formatting and import sorting; eight commits considered
  delivered. Mechanism: only the affected test file per step, test runner does not run the format
  check, `git log origin/main` shows the commit anyway; noticed by a version bump. A red release
  publishes nothing. The push gate (from §13.3): full chain before push via a global pre-push hook,
  watch the run to completed/success, sweep touched repositories, and the semantic-release rule
  (behind the remote = silently no release; bundle backend waves, push once). Blockquote: "Red is
  the finding". Exit codes vs. prose.

### H2: Built correctly, and pointless
- Trades software test round; competitor-driven plans verified against the code; tours as an address
  text area, checklist execution on the template page, appointment booking without closing the loop.
  Four changes: mandatory `## User job` section (persona, job sentence, connection, done scenario);
  done = played through as the persona; sense check with five questions, findings triaged (fix,
  rework, remove from navigation, delete); module toggle. Blockquote from §20. Why a green build
  hides this best.

### H2: What I would do again, and what I would not
- The two lists from §22, nine and seven items, verbatim in substance; a short gloss after each.

### Close
- The two rules of the part, then the series thought in two sentences (the agent writes the code;
  everything around it decides). No CTA (added by the editor).

## Internal links
- `/docs/guide/equivalence/overview` (on "Tables" in "a table for every trifle")

## Numbers used (all from the report)
- nine months; 74 repositories; ~14,000 commits; ~1,240 plans (§2, recap only)
- three agents on one day; a fourth nine days later; a fifth the same day; five within ten days (§18.1)
- eight consecutive red release runs; eight commits (§18.2)
- five questions in the sense check (§20)
- nine items again, seven items not again (§22, counts of the lists)
- two pure functions with six cases (§22)
- one sheet from 10 to 157 cases (§22)

## SEO block
- Meta description (≤ 160 chars): "Five bypassed test hooks, eight unnoticed red CI runs, features built correctly and pointless. Why rules need exit codes, and what I would do again."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-rules-need-exit-codes/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-rules-need-exit-codes/linkedin-post-en.txt` (English, from the series
plan, with the real URL). No image.

## Notes
- Claude Code is named once, in the lede, where the instruction file `CLAUDE.md` and the
  `PreToolUse` hook make the tooling concrete. Nanook is not named; the tables appear as "the table"
  and "Tables" (§22), with one link to the equivalence-class guide.
- Verbatim quotes kept with their em dashes: the prohibition wording, the hook's denial message, the
  §20 blockquote. "Red is the finding: report it, don't bypass it." as a blockquote.
- The push gate is summarised in one paragraph, since part 7 covers release cascades; the
  semantic-release rule is included because §18.2 points to §13.3 for it.
- The closing paragraph rephrases the series thesis (structure, order, gates, retained knowledge)
  and does not repeat the ten sentences from part 1 or its blockquote verbatim.
- Deliberately left out: §18.2's wording "the error surfaces hours later somewhere completely
  different" is kept, but nothing further about where; §22's items are not expanded beyond the
  report's own explanations. The series plan's note "closing with the ten sentences" was overridden
  by the assignment (two-sentence close instead).
- Series navigation and the closing CTA are added by the editor.
