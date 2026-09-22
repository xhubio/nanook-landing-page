# PRD: Blog Post -- "Working Through 1,200 Plans: A Pipeline, a Ledger, and Many Repositories"

## Metadata

| Field | Value |
|---|---|
| **Title** | Working Through 1,200 Plans: A Pipeline, a Ledger, and Many Repositories |
| **Meta title** | Working Through 1,200 Plans · Nanook |
| **Subtitle** | Agentic software development, part 7 of 9: the autonomous plan pipeline, release cascades, parallel sessions |
| **URL Slug** | `/blog/2026/11/03/plan-pipeline-and-release-cascades` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-11-03 |
| **Word Count Target** | ~2,000 words |
| **Status** | Scheduled 2026-11-03 |
| **Type** | Series part / field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §12, §13, §19; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 7 |

---

## Target Audience

- Teams running an AI coding agent unattended over many work items and wondering how it survives
  crashes and resumes
- Engineers maintaining a multi-repository platform (shared packages, semantic-release, npm) where
  one change cascades through many releases
- Anyone who has run two agent sessions in the same checkout and wants to know what goes wrong before
  it does

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | autonomous AI coding agent pipeline |
| **Secondary** | agent orchestration ledger, release cascade across repositories, semantic-release multi-repo, parallel AI agent sessions git |
| **Long-tail** | resume an AI agent run after a crash, write-ahead ledger for agents, git add -A shared working tree, sub-agent goes silent background task, which model for orchestrator vs implementation |

## Goal

Describe how a pipeline works through plans without a person in the loop and what keeps it safe: the
four steps (audit, implement, release, move), a ledger with a small status vocabulary written before
the work rather than after it, model assignment with a delegation threshold, and the "a decision is
the go" rule. Then how one change reaches all repositories (app parity, `/update-cascade`, the push
gate, the semantic-release skip), and finally the five incidents from parallel sessions in one
checkout and the six rules that followed.

## Outline

### Lede
- Recap: 74 repositories, ~1,240 completed plans; one plan at a time becomes the bottleneck; a
  Claude Code skill `plan-pipeline` and a loop command (the one mention of the agent by name).

### H2: Audit, implement, release, move
- §12.1: the four steps for a `REQUIREMENTS/<PRODUCT>` folder; plans that are partially done or claim
  to be done; one sub-agent per step; blocked remainders extracted.

### H2: The ledger: the pipeline's memory
- §12.2: Markdown table, status vocabulary (`open`, `verified-open`, `in-work`, `blocked`, `extern`,
  `done`); every change written immediately; write-ahead `IN FLIGHT` table (non-empty at startup =
  a turn died; Git is the truth); size in bytes (`head -c 40000`, ~10k tokens; archive above 150 KB;
  800 characters per row).

### H2: Which model does what, and when not to delegate
- §12.3 table (orchestrator, implementation/browser QA/code review on the strong model; cascades,
  scaffolding, drift checks on the faster model); delegation threshold (about five Git commands,
  second-long builds, one-line fixes); the brief/summary information loss.

### H2: A decision is the go
- §12.4: the rule; eleven plans parked as "decision made, go missing".

### H2: One change, many repositories
- §13.1 app parity (e-invoicing API, trades software, PDF API; fix the bug in all apps at once;
  rule marked critical in the instruction file). §13.2 release cascades: topological order,
  `/update-cascade`, up to nine sub-agents on a fast model, pin file. §13.3 push gate: full chain
  before push via global `pre-push` hook; the CI run counts, watch until `completed/success`, sweep
  touched repositories; a green CI run without a release publishes nothing (semantic-release skips
  when the branch is behind the remote); bundle backend waves, push once. Forward reference to
  part 9.

### H2: Parallel sessions in one checkout
- §19: five incidents (foreign unfinished commits, `git add -A`, `git stash pop`, two test suites,
  silent agents) and six rules (push ban with explicit paths, re-check before every increment,
  worktrees, foreign red tests, liveness on the process, at most three sub-agents).

### Close
- Rules: ledger before the work and Git is the truth; a decision is the go; shared change means
  every app, CI run over push, release over CI run; commit by explicit path, never push, liveness on
  the process. No CTA (added at registration).

## Internal links
- None used in the body. Candidates if wanted at registration:
  `/blog/2026/08/21/testing-a-saas-with-nanook` (the platform's test suite behind the push gate).

## Numbers used (all from the report)
- Lede: 74 repositories; ~1,240 completed plans (§2 figures as recap; §12 refers to the same volume)
- §12.2: `head -c 40000`, ~10k tokens; 150 KB archive threshold; 800 characters per row
- §12.3: about five Git commands as the delegation threshold
- §12.4: eleven plans parked
- §13.1: three apps named as categories (e-invoicing API, trades software, PDF API)
- §13.2: 74 repositories; up to nine sub-agents in parallel
- §19: two repositories; twenty minutes; five unpushed foreign commits; twelve modified files; six
  files in a commit; 18 minutes; at most three sub-agents at a time

## SEO block
- Meta description (≤ 160 chars): "How an autonomous agent pipeline worked through 1,240 plans across 74 repositories: a crash-safe ledger, release cascades, parallel sessions in one checkout."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-plan-pipeline-and-release-cascades/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-plan-pipeline-and-release-cascades/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL; bold "ledger" and "parallel sessions" rendered as capitals). To be
moved to `prds/assets/linkedin-plan-pipeline-and-release-cascades/` at registration. No image.

## Notes
- Nanook is not named in the body; there is no table topic in §12, §13 or §19 where the report names
  it.
- Claude Code is named once, in the lede, where the skill and loop command are introduced.
- The report has `/update-cascade` running up to nine sub-agents in parallel, and rule 6 of §19
  capping sub-agents at three across all types. Both figures are kept as the report states them;
  the post does not try to reconcile them. Worth a check with the author before publishing.
- The status vocabulary is given inline with `<code>`, not as a table, because the report glosses
  only `extern`.
- Part 9 is referenced forward once (bypassed hooks, unnoticed red CI runs). Series navigation is
  added at registration.

## Author question (open)

§13.2 says the cascade command runs up to nine sub-agents in parallel; §19 caps sub-agents at three across all types. The post keeps both figures as the report states them. Confirm which holds today, or whether the cascade is exempt from the cap, and adjust one sentence.
