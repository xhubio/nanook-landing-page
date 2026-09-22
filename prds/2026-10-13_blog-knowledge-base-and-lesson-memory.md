# PRD: Blog Post -- "What the Next Session Knows: A Knowledge Base and a Memory of Lessons"

## Metadata

| Field | Value |
|---|---|
| **Title** | What the Next Session Knows: A Knowledge Base and a Memory of Lessons |
| **Meta title** | What the Next Session Knows · Nanook |
| **Subtitle** | Agentic software development, part 4 of 9: two stores for two questions |
| **URL Slug** | `/blog/2026/10/13/knowledge-base-and-lesson-memory` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-10-13 |
| **Word Count Target** | ~1,100 words |
| **Status** | Scheduled 2026-10-13 |
| **Type** | Series part / field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §7 (recap figures from §2); `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 4 |

---

## Target Audience

- Teams whose coding agent starts every session from zero and keeps re-learning the same project
- Engineering leads deciding where project knowledge should live so an agent can find it
- Readers of parts 1 to 3 who want the mechanism behind "knowledge that survives the session"

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | AI agent knowledge base |
| **Secondary** | LLM wiki, agent memory, Claude Code memory, lessons learned file, coding agent context |
| **Long-tail** | what does an AI coding agent remember between sessions, how to keep an LLM-maintained wiki, one lesson per file agent memory |

## Goal

Explain the two stores that decide what a fresh agent session knows, and why they are two: a
knowledge base that answers "how does our system work?" (own repository, raw material compiled into
dated wiki articles, four topics, reachable over MCP) and a lesson memory that answers "what went
wrong, and how do we avoid it?" (327 one-lesson-per-file notes, fixed note shape, about twenty
failure classes). Close with the three observations about keeping such a memory. No tool review;
Nanook is not mentioned (the report section does not mention it).

## Outline

### Lede
- A session starts empty; after nine months and 74 repositories the deciding question is "what does
  the next session know?". Two stores for two questions.

### H2: The knowledge base: how does our system work?
- Own repository. Attribution sentence (Karpathy LLM-wiki model, link placeholder
  `@@KARPATHY_LINK@@` to be replaced). Tree as code block (raw, append-only, fed by the author;
  wiki, compiled by the LLM; `sources.md` manifest; `index.md`; `common/`; `<product>/`).
- Compile rules: one concept per file; `Stand: <date> · Source: …` plus one-line summary;
  backlinks; distil, do not copy; source wins and date updated; lint skill for dead links, stale
  dates, orphans, contradictions.
- What goes in: directory structure, target environment (dev/test/staging/prod), four topics
  (development, test, deployment, production) as a list.
- Every completed plan contributes (plan to `done/`, knowledge to wiki). MCP server with search and
  read tools.

### H2: The lesson memory: what went wrong, and how do we avoid it?
- Agent-written, one lesson per file, index loaded into every session, 327 entries.
- Note shape as code block (name / description / type: feedback; what happened; Why; How to apply).
- Index grouped by failure class (ten named classes from the report); about twenty classes after a
  few hundred lessons; later parts of the series draw on them.

### H2: Three observations about keeping a memory
- A lesson solved locally comes back (fixed three times with a comment, stopped the fourth time as
  a rule).
- A lesson needs the mechanism, not just the incident (the two example sentences from the report).
- Memories go stale (file, function, flag; verify before acting). Knowledge base has the milder
  form of the same problem.

### Close
- Rules: two stores; compile and date, source wins; every lesson with its mechanism; both stores are
  claims about the past that the present has to confirm. No CTA in the body (added at publication).

## Internal links
- none (no guide or blog page fits this part; series navigation is added at publication)

## External links
- Karpathy LLM-wiki reference: placeholder `@@KARPATHY_LINK@@` in the body, to be replaced before
  publishing (series plan, open point 1)

## Numbers used (all from the report, measured 2026-09-17; re-measure or keep the date)
- nine months, 74 repositories (recap, §2)
- 327 lesson notes (§7.2)
- about twenty failure classes; ten of them named (§7.2)
- four topics (§7.1)
- same mistake fixed three times, stopped the fourth time (§7.2)
- Not used, deliberately: 66 articles from 122 sources (§2, not §7)

## SEO block
- Meta description (≤ 160 chars): "An AI agent session starts empty. Two stores decide what the next one knows: a knowledge base and a memory of 327 lessons in about twenty failure classes."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-knowledge-base-and-lesson-memory/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-knowledge-base-and-lesson-memory/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL). To be moved to `prds/assets/linkedin-knowledge-base-and-lesson-memory/`
as `linkedin-post.txt` and `linkedin-post-en.txt` at publication. No image.

## Notes
- The directory name in the tree is `knowlage-base/`, spelled as in the report (twice, §5.1 and §7.1);
  it looks like the real directory name. Correct it in both places or keep it, but consistently with
  part 3.
- The attribution sentence is verbatim as briefed; the link target is decided at publication
  (series plan, open point 1).
- Claude Code is not named in the body; "the agent" and "MCP server" carry it.
- Nanook does not appear in this part (tone rule; the report section has no table content).
- The report is first person; the post keeps it (author Torsten Link).
- Registration: the six places from AGENTS.md; link the row in the part 1 series table (+ twin).
