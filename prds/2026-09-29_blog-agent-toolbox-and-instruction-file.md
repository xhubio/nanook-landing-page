# PRD: Blog Post -- "Fewer Skills, Shorter Rules: Setting Up a Coding Agent That Does Not Drown in Its Own Instructions"

## Metadata

| Field | Value |
|---|---|
| **Title** | Fewer Skills, Shorter Rules: Setting Up a Coding Agent That Does Not Drown in Its Own Instructions |
| **Meta title** | Fewer Skills, Shorter Rules · Nanook |
| **Subtitle** | Agentic software development, part 2 of 9: the toolbox, the instruction file, the budget |
| **URL Slug** | `/blog/2026/09/29/agent-toolbox-and-instruction-file` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-09-29 |
| **Word Count Target** | ~1,600 words (draft: 1,598) |
| **Status** | Scheduled 2026-09-29 |
| **Type** | Field report / setup |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §3, §4, §21; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 2 |

---

## Target Audience

- Developers who run a coding agent in the terminal and have watched their `CLAUDE.md` (or
  `AGENTS.md`) grow past the point where anyone reads it
- Teams that installed skill collections and MCP servers and have never measured which ones are used
- Engineering leads who hit a token budget and need a model assignment that is based on a measurement

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | Claude Code instruction file |
| **Secondary** | CLAUDE.md best practices, coding agent skills, Playwright MCP, agent token cost, path-bound rules |
| **Long-tail** | how long should CLAUDE.md be, archive unused Claude Code skills, coding agent weekly budget model assignment |

## Goal

Show the innermost layer of the structure around the agent: the toolbox and the instruction file,
and the one failure mode both share (growth). Give the measured case for pruning (14 skills unused in
91 sessions), the concrete shape of a 170-line instruction file with one sentence per rule and
path-bound long rules, and the budget decisions that came from hitting the weekly limit on day three.
The post is a setup post; the failures that motivate some of its rules belong to parts 8 and 9.

## Outline

### Lede
- Two-sentence recap (nine months SaaS platform, eleven days service; the agent writes the code, the
  structure makes it trustworthy). Toolbox and instruction file share one failure mode: they grow.

### H2: Start with Superpowers, then adapt it
- Superpowers as the starting point, never unchanged. Three lines of adaptation: paths and
  conventions (`REQUIREMENTS/<PRODUCT>/plan/`, `## User job`), project language, project-specific
  skills on top (e-invoicing country onboarding with SHA-256 pinning, drift checks, VPS deployment,
  decision tables, plan pipeline, browser QA walkthrough, dependency cascades).

### H2: A browser for anything with a frontend
- Playwright MCP: claiming versus checking. One browser per parallel session (`playwright`,
  `playwright-2`, `playwright-3`). A walkthrough answers "does it work?", not "is it correct?"; the
  owner-account walkthrough never finds a missing permission check (forward pointer to part 8).

### H2: The token diet
- Every description travels with every request. Rule: delete or archive what is not needed.
  Measured 2026-09-03: 14 skills not invoked once in 91 sessions; five original Superpowers process
  skills among them, absorbed by the pipeline; `.claude/skills-archiv/` with README. 24 active, 14
  archived today. Blockquote verbatim: "Unused capability is not free."

### H2: An instruction file of 170 lines
- The file rots: each incident adds a paragraph. 170 lines, one sentence per rule plus pointer; the
  two-rule Markdown example; `.claude/rules/` ten files, 913 lines; the YAML path filter; the rule
  loads only where it applies; the caveat verbatim (decide without opening a file -> read by hand).

### H2: What belongs in the instruction file at all
- Always true, one-sentence rules, pointers. Not: history, measurements, examples, one-off decisions.

### H2: Cost is a design constraint
- Weekly limit after three days; orchestrator 30 % on the most expensive model; new assignment
  (orchestrator cheaper-strong, implementation strong, cascades fast). Max three sub-agents. Briefs
  with line ranges (120–180). Ledger read by head, archived by size (forward pointer to part 7).
  Archived skills and short file as budget measures. "The cheapest token is the one that never
  enters the context." Caveat that the numbers are this setup's, not a recommendation.

### Close
- Three rules: archive what is unused (measured, not guessed); one sentence per hard rule, the rest
  path-bound; every brief, ledger read and model assignment chosen with the budget in view.

## Internal links
- `/docs/quickstart/claude-code` (from "building decision tables" in the project-skills list)

External (from the report): `https://github.com/obra/superpowers`,
`https://github.com/microsoft/playwright-mcp`.

## Numbers used (all from the report; section in brackets)
- nine months, eleven days (§2, recap only)
- three named Playwright instances (§3.2)
- 2026-09-03 measurement; 14 skills; 91 sessions; one month; five Superpowers process skills (§3.3)
- 24 active skills, 14 archived (§2; the §3.3 archive is the same 14)
- 170 lines instruction file (§4.2)
- ten rule files, 913 lines (§4.2)
- weekly limit reached after three days; orchestrator 30 % of weekly budget (§21)
- at most three sub-agents (§21)
- "read lines 120–180 of X" (§21)

## SEO block
- Meta description (159 chars): Skills, MCP servers and an instruction file for a coding agent: 14 unused skills archived, 170 lines of rules that load themselves, and what the budget taught.
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-agent-toolbox-and-instruction-file/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-agent-toolbox-and-instruction-file/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL). No image.

## Notes
- Claude Code is named once, where the instruction file is introduced (`CLAUDE.md` for Claude Code,
  `AGENTS.md` for others). Nanook is not named in the body; the only Nanook touchpoint is the link on
  "building decision tables".
- Verbatim from the report: the blockquote "Unused capability is not free …", the italic caveat
  "if you decide something in an area without opening a file there …", the closing line "The
  cheapest token is the one that never enters the context", both code blocks (Markdown rules,
  YAML path filter). The Markdown example contains the 🔴 marker and an arrow as in the report.
- Left out of §3–§4/§21 on purpose: nothing substantive. §21's reference to section 12.2 (ledger
  write-ahead, `head -c 40000`, 150 KB) is summarised as "read by its head, archived by size" and
  deferred to part 7. Model names are not given because the report does not give them.
- Forward references: part 7 (pipeline and ledger), part 8 (absences / request counter).
