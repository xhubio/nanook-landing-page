# Use Nanook with AI agents

Source: https://nanook.xhub.io/docs/guide/use-with-ai

A coding agent can draft a Nanook table and the script that turns it into test data. It does that well when it has three things: skills that know how a decision table is built and how test data comes out of it, a few rules that keep the generation script correct, and the documentation as plain text. This page lists all three for Claude Code and for other agents. None of it replaces checking what the agent produced; the last section says how.

## 1 · Claude Code: the skills

Since skill version 0.2.0 the skill `create-equivalence-class-table` ships as a Claude Code plugin, straight from the GitHub repository. Install it once in Claude Code (already installed? `/plugin marketplace update nanook` and `/plugin update nanook@nanook` bring the second skill below):

```
/plugin marketplace add xhubio/nanook-table
/plugin install nanook@nanook
```

Then, in a project with Nanook and `exceljs` installed (in a new project, start with `npm init -y` and `npm pkg set type=module`):

```
npm install @xhubio/nanook-table
npm install -D exceljs
claude
/nanook:create-equivalence-class-table Login Form
```

The skill copies two scripts into your project: `check-classes.mts` recounts the coverage and reports every class without a test case of its own, `generate-fixtures.mts` runs Nanook and writes one JSON per test case. What a run produces, how long it took and what to watch for is on [Quickstart with Claude Code](https://nanook.xhub.io/docs/quickstart/claude-code). Without the plugin, copy the skill from the package (any version after 3.0.1): `mkdir -p .claude/skills && cp -r node_modules/@xhubio/nanook-table/skills/create-equivalence-class-table .claude/skills/`.

The second skill, `generate-test-data` (in the plugin since skill version 0.4.0, in the npm package since Nanook 3.2.0; use 3.2.1 or later), starts from a table that already exists: drafted by the first skill, built by hand or taken over from an older project. It needs no `exceljs`:

```
/nanook:generate-test-data resources/login-tests.xlsx
```

It first runs `inspect-workbook.mts`, which reads the workbook with Nanook’s own parser and reports the minimum number of test cases, every generator the table calls but nobody registers, broken references and filters. Then it resolves the missing generators with you (fix the cell, reuse one from the project, or write one), generates one JSON per test case with `generate-fixtures.mts`, compares the count with that minimum and reads the fixtures into Vitest or Playwright tests. Without the plugin: `cp -r node_modules/@xhubio/nanook-table/skills/generate-test-data .claude/skills/`.

## 2 · Other agents

Each skill is a plain folder with a `SKILL.md` in the [Agent Skills](https://agentskills.io) format. One command per skill installs it for Codex, Cursor, GitHub Copilot, Gemini CLI and other agents that read that format:

```
npx skills add xhubio/nanook-table --skill create-equivalence-class-table
npx skills add xhubio/nanook-table --skill generate-test-data
```

The skills are listed on [skills.sh](https://skills.sh/xhubio/nanook-table), the directory behind that command. We have run them in Claude Code only (the second one step by step in a test project, not yet in a full agent run) and checked the install of the first one for Codex, so treat other agents as untested. The rules block in the next section does not depend on skills and works in any agent that reads `AGENTS.md`.

## 3 · A rules block for AGENTS.md

[`AGENTS.md`](https://agents.md) is the instruction file that Codex, Cursor, GitHub Copilot and other agents read from the project root. Paste this block into it. The markers let you replace the block later without touching the rest of the file:

```
<!-- BEGIN:nanook-agent-rules -->
## Nanook: test cases and test data

Test cases are defined in XLSX workbooks and turned into test data with
@xhubio/nanook-table (Node.js 22 or newer, ESM).

- Before writing a table or a generation script, read the docs for the
  installed version: node_modules/@xhubio/nanook-table/docs/
  (guide/decision-tables.md, guide/directives.md, api/processor.md).
  Website index: https://nanook.xhub.io/llms.txt
- Every generator a table calls (gen:<instanceId>:<generator>:<parameter>)
  must be registered in the DataGeneratorRegistry. The built-in
  GeneratorFaker takes a Faker path and no arguments; anything else
  needs its own generator.
- Pass the tables to TestcaseProcessor keyed by table name, not as the
  array from FileProcessor, or every ref: fails.
- In 3.0.1 the default writer throws in before(); use an inline
  InterfaceWriter.
- After generating, compare the number of test cases with the number of
  test-case columns (plus one per extra element of a range reference).
  Fewer means a generator failed: Nanook logs the error and goes on.
<!-- END:nanook-agent-rules -->
```

Claude Code reads `CLAUDE.md`. Put the line `@AGENTS.md` into it and Claude Code imports the same rules, so both files never drift apart.

The block points the agent to the Markdown documentation inside the package. Unlike the pages on this site, it always matches the installed version: the guide and tutorials here describe the table concepts, and the 3.x API reference is under [API](https://nanook.xhub.io/docs/api). Rules two to four are mistakes that cost a run its test cases on 3.0.1; the last one is how you notice. The quickstart describes them under [Generate the test data](https://nanook.xhub.io/docs/quickstart/claude-code#generate-the-test-data) and [What can go wrong](https://nanook.xhub.io/docs/quickstart/claude-code#what-can-go-wrong).

## 4 · The docs as plain text

For a chat window, an agent that fetches URLs, or one with an MCP server for docs:

- [`/llms.txt`](https://nanook.xhub.io/llms.txt) is the index: every docs page with one line on what it covers, in the [llms.txt](https://llmstxt.org) format.
- [`/llms-full.txt`](https://nanook.xhub.io/llms-full.txt) is the whole documentation in one Markdown file, to paste or attach.
- Every quickstart, guide, tutorial and module page and the 3.x API reference has a Markdown version: add `.md` to its address, for example [`/docs/quickstart/quickstart.md`](https://nanook.xhub.io/docs/quickstart/quickstart.md). The *Copy as Markdown* button at the top of those pages puts it on the clipboard. The 1.x API pages have none.
- Inside a project, the package itself carries the 3.x documentation as Markdown in `node_modules/@xhubio/nanook-table/docs/`, matching the installed version.
- [Context7](https://context7.com/xhubio/nanook-table) indexes the documentation in the repository; agents with the Context7 MCP server fetch it from there. Its index is refreshed from time to time and can lag behind the repository.

## 5 · Check what the agent produced

An agent that writes a table and a script will report success. Two checks catch most of what goes wrong. First, open the workbook: if `create-equivalence-class-table` built it, its summary row shows the coverage per sheet. Second, count: the script must report one test case per test-case column, plus one for every extra element of a range reference. Fewer means a generator failed on the way, and Nanook logs that and keeps going. The quickstart explains the count under [Generate the test data](https://nanook.xhub.io/docs/quickstart/claude-code#generate-the-test-data). For a table you already have, `inspect-workbook.mts` from the second skill prints the minimum per table before anything is generated (executed columns times Multiplicity) and marks the columns a range reference adds to.

## Not yet

There is no Nanook MCP server yet. An agent with a terminal does not need one: it runs the generation script itself.

## Where to go next

- [Quickstart with Claude Code](https://nanook.xhub.io/docs/quickstart/claude-code): from an empty directory to generated test data, as recorded.
- [The login example](https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table): a table Claude drafted, column by column, and what it got wrong.
- [Equivalence class tables](https://nanook.xhub.io/docs/guide/equivalence/overview): the concepts, for when you edit what the agent drafted.

---
Index of all docs: https://nanook.xhub.io/llms.txt
