# PRD: Docs page -- "Quickstart with Claude Code"

## Metadata

| Field | Value |
|---|---|
| **Title** | Quickstart with Claude Code |
| **URL** | `/docs/quickstart/claude-code` (Docusaurus docs shell, sidebar group Quickstart) |
| **Type** | Docs page, step-by-step, verified by a real run |
| **Status** | Published 2026-09-02 |
| **Source material** | `.claude/skills/create-equivalence-class-table/SKILL.md` and `.claude/commands/createEquivalenceClassTable.md` in @xhubio/nanook-table 3.0.1 (npm tarball); the run recorded below; blog posts 2026-03-29 and 2026-08-22 |
| **Companion** | `prds/upstream_2026-09-02_claude-code-quickstart.md` (what nanook-table should change) |

## Target audience

- Developers who have their own project and want the first decision table drafted for them,
  without cloning the nanook-table repository
- Testers without a terminal who can ask Claude Desktop or claude.ai/code for the table and hand
  the workbook over (secondary)

## Target keywords

| Type | Keywords |
|---|---|
| **Primary** | Claude Code test data |
| **Secondary** | AI decision table, equivalence class table Claude, Claude Code skill, test data generation AI |
| **Long-tail** | copy Claude Code skill from npm package, generate test data from an AI-drafted table |

## Goal

One page that takes a developer from an empty directory to generated test data in three numbered
steps, with every command and every number taken from a run that was actually made. The page
must be honest about the state of the skill (German text, `exceljs` not a dependency, default
`scripts/` and `resources/` layout, the "fewer cases than columns" failure).

## Outline

1. Lede with the verification stamp (date, package version, skill version, Claude Code version)
2. What you need (Node >= 22, Claude Code, a project directory; no clone)
3. 1 · Install Nanook and the skill (npm install, `exceljs`, `cp -r` from `node_modules`; the
   German-text note; the folder-layout note)
4. 2 · Ask for a table (`claude`, `/createEquivalenceClassTable Login Form`; the six steps;
   what the verified run produced; how to give the fields; link to the login example)
5. 3 · Generate the test data (the site's `generate.mts`, path from the run; the case count
   from the run; "Check the number")
6. What can go wrong (five verified items)
7. No terminal? (three sentences, no plugin promise)
8. Where to go next (five links)
9. Provenance line

## The run behind the page

- 2026-09-02, scratch project outside the repository, macOS, Node.js 24.16.0, npm-installed
  @xhubio/nanook-table 3.0.1, exceljs 4.4.0, skill 0.1.0 and command copied from `node_modules`,
  Claude Code 2.1.258, `claude -p "/createEquivalenceClassTable Login Form" --permission-mode acceptEdits`
- Skill and command were discovered from the copied `.claude/` folder; 56 turns (Claude Code `num_turns`; tool calls per turn not recorded), 17.5 min,
  US$ 10.15 of API usage at list price, no questions asked (headless), final message in German
- Produced: `resources/login-form-tests.xlsx` (sheets `User` Execute F: 7 columns, 15 combinations,
  100 %; `Login` Execute T: 7 columns, 48 combinations, 100 %), `scripts/create-login-form-table.ts`
  (744 lines, exceljs, aborts below 100 %), `scripts/check-login-form-table.ts` (recount from the
  file), `scripts/generate-login-form-fixtures.ts` (custom `text` generator + JSON writer)
- `node scripts/generate-login-form-fixtures.ts`: 11 fixtures, no warnings, no errors
- The site's minimal script (`generate.mts` from the quickstart) against the same workbook:
  with `tables: fileProcessor.tables` (an array in 3.0.1) every reference fails with
  `The targetTable 'User' does not exists` and 7 cases come out; with the tables keyed by name
  and Faker only: 5 cases, two errors `There was no generator registered with the name 'text'`;
  with Claude's `text` generator added: 11 cases, clean. **The site script was corrected on the
  start page and the quickstart (tables keyed by name).**
- Claude ran the scripts with `node scripts/*.ts` directly (Node 24); `tsx` was not installed
- Table content (comments, expected-result texts) is German although the prompt was English; the
  skill text is German
- Evidence: `prds/assets/claude-code-quickstart/` (workbook, three scripts, one fixture, run summary)

## Registration

- Page + byte-identical twin `docs/quickstart/claude-code/index.html`
- Docs sidebar entry in the 40 guide/tutorial/quickstart/module pages (script, 2026-09-02)
- `docs/index.html` hub row; `docs/quickstart/quickstart.html` paragraph + next link;
  `docs/tutorials/createEquivalenceClassTable.html` paragraph
- `index.html`: hero CTA, hero tab "Draft the table", step 1 text + link (visible and HowTo
  JSON-LD), FAQ answer (visible and FAQPage JSON-LD)
- Blog 2026-03-29 dated note + requirements bullet; blog 2026-08-22 link in "Try It on Your Own Form"
- `llms.txt`, `sitemap.xml`

## SEO block

- Meta description (<= 160 chars): "Let Claude Code draft the Nanook decision table for a form or API, then generate the test data. The skill ships in the npm package; verified step by step."
- BreadcrumbList JSON-LD (Home > Documentation > Quickstart with Claude Code), canonical, og:*
