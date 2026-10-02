# PRD: Docs page -- "Use Nanook with AI agents"

## Metadata

| Field | Value |
|---|---|
| **Title** | Use Nanook with AI agents |
| **URL** | `/docs/guide/use-with-ai` (Docusaurus docs shell, sidebar group Guides, first entry) |
| **Type** | Docs page, reference for setup; no new run behind it (it points to the verified quickstart for the run) |
| **Status** | Ready 2026-10-02 (lektor run done; not pushed) |
| **Source material** | @xhubio/nanook-table 3.0.1 npm tarball (checked 2026-10-02: ships `docs/` with the 3.x guides and API as Markdown, `.claude/skills/create-equivalence-class-table/SKILL.md`, `.claude/commands/createEquivalenceClassTable.md`); `/docs/quickstart/claude-code` and its PRD; agents.md; llmstxt.org; Claude Code memory docs (`@path` imports in `CLAUDE.md`) |
| **Companion** | `prds/upstream_2026-09-02_claude-code-quickstart.md` (P3 plugin; when it ships, section 1 gets the plugin commands) |

## Why

Comparable projects (Svelte, Astro, Next.js, Stripe, Prisma, Vitest) have one page that answers
"how do I give my agent what it needs": a skill or plugin, a rules block for `AGENTS.md`, and the
docs as plain text (`llms.txt`, `llms-full.txt`, Markdown per page). Nanook had the skill and an
`llms.txt`, scattered over a quickstart and a blog post, and nothing for agents other than Claude
Code.

## Target audience

- Developers who already use Claude Code, Cursor, Codex, Copilot or Gemini CLI and want the agent
  to write Nanook tables and generation scripts that work on the first run
- Developers who paste docs into a chat and want one URL for it

## Target keywords

| Type | Keywords |
|---|---|
| **Primary** | Nanook AI agent |
| **Secondary** | AGENTS.md test data, llms.txt test data generator, Claude Code skill decision table |
| **Long-tail** | give coding agent docs for test data generation, AGENTS.md rules for equivalence class tables |

## Outline

1. Lede: three things an agent needs: a skill that drafts the table, rules that keep the script
   correct, the docs as plain text. Nothing here replaces checking the result.
2. 1 · Claude Code: the skill (today's copy path from the npm package, same commands as the
   quickstart; link to the quickstart for the full run)
3. 2 · Other agents: the skill is a plain `SKILL.md` folder in the Agent Skills format; only run
   in Claude Code so far (say so); the rules block (section 3) works everywhere
4. 3 · A rules block for `AGENTS.md`: copyable, with markers; `CLAUDE.md` with `@AGENTS.md` for
   Claude Code. Content: package, the docs in `node_modules` for the installed version, the
   llms.txt URL, the three 3.0.1 pitfalls (default writer, tables keyed by name, Faker takes no
   arguments), the case-count check
5. 4 · The docs as plain text: `/llms.txt`, `/llms-full.txt`, `.md` next to every docs page,
   "Copy as Markdown" button, the Markdown docs inside the package
6. 5 · Check what the agent produced: the number check, link to quickstart "Check the number"
7. Not yet: no MCP server, no plugin (one sentence each, no dates)
8. Where to go next

## Facts the page may state (all checked 2026-10-02)

- npm `@xhubio/nanook-table` 3.0.1 tarball contains `docs/guide/{overview,decision-tables,matrix-tables,specification-tables,directives}.md`,
  `docs/api/{data-generator,file-processor,logger,model,processor}.md`, `docs/tutorials/*.md`
- Reference directive syntax `ref:<instanceIdSuffix>:<tableName>:<testcaseName>:<fieldName>` (package `docs/guide/directives.md`)
- 3.0.1 pitfalls as documented on `/docs/quickstart/claude-code` (run 2026-09-02)
- The page must not claim the skill was run in any agent other than Claude Code

## Registration (six places, docs variant)

`docs/guide/use-with-ai.html` + twin, sidebar entry in all 22 docs pages with the Guides group
(`tools/docs-chrome.py`), `docs-hub-row` in `docs/index.html`, `sitemap.xml`, `llms.txt`.
Markdown version via `tools/build-llms.py`.
