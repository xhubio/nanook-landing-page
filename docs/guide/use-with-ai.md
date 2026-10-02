# Use Nanook with AI agents

Source: https://nanook.xhub.io/docs/guide/use-with-ai

A coding agent can draft a Nanook table and the script that turns it into test data. It does that well when it has three things: a skill that knows how a decision table is built, a few rules that keep the generation script correct, and the documentation as plain text. This page lists all three for Claude Code and for other agents. None of it replaces checking what the agent produced; the last section says how.

## 1 · Claude Code: the skill

The skill `create-equivalence-class-table` and the slash command `/createEquivalenceClassTable` ship inside the npm package. Claude Code reads skills from your project’s `.claude` folder, so copy them there once. In a new project, start with `npm init -y` and `npm pkg set type=module`:

```
npm install @xhubio/nanook-table
npm install -D exceljs
mkdir -p .claude/skills .claude/commands
cp -r node_modules/@xhubio/nanook-table/.claude/skills/create-equivalence-class-table \
  .claude/skills/
cp node_modules/@xhubio/nanook-table/.claude/commands/createEquivalenceClassTable.md \
  .claude/commands/
```

Then run `/createEquivalenceClassTable Login Form` in Claude Code. What that produces, how long it took and what to watch for is on [Quickstart with Claude Code](https://nanook.xhub.io/docs/quickstart/claude-code), every step from a recorded run. The skill text is German; ask for English output if you want it.

## 2 · Other agents

The skill is a plain folder with a `SKILL.md` in the [Agent Skills](https://agentskills.io) format. Agents that read that format can use the same folder; where each one looks for skills is in its own documentation. We have run the skill in Claude Code only, so treat other agents as untested. The rules block in the next section does not depend on skills and works in any agent that reads `AGENTS.md`.

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

For a chat window, or an agent that fetches URLs:

- [`/llms.txt`](https://nanook.xhub.io/llms.txt) is the index: every docs page with one line on what it covers, in the [llms.txt](https://llmstxt.org) format.
- [`/llms-full.txt`](https://nanook.xhub.io/llms-full.txt) is the whole documentation in one Markdown file, to paste or attach.
- Every quickstart, guide, tutorial and module page and the 3.x API reference has a Markdown version: add `.md` to its address, for example [`/docs/quickstart/quickstart.md`](https://nanook.xhub.io/docs/quickstart/quickstart.md). The *Copy as Markdown* button at the top of those pages puts it on the clipboard. The 1.x API pages have none.
- Inside a project, the package itself carries the 3.x documentation as Markdown in `node_modules/@xhubio/nanook-table/docs/`, matching the installed version.

## 5 · Check what the agent produced

An agent that writes a table and a script will report success. Two checks catch most of what goes wrong. First, open the workbook: if the skill built it, its summary row shows the coverage per sheet. Second, count: the script must report one test case per test-case column, plus one for every extra element of a range reference. Fewer means a generator failed on the way, and Nanook logs that and keeps going. The quickstart explains the count under [Generate the test data](https://nanook.xhub.io/docs/quickstart/claude-code#generate-the-test-data).

## Not yet

There is no Nanook MCP server and no Claude Code plugin yet. An agent with a terminal does not need either: it runs the generation script itself. When the skill ships as a plugin, section 1 gets two commands instead of the copy.

## Where to go next

- [Quickstart with Claude Code](https://nanook.xhub.io/docs/quickstart/claude-code): from an empty directory to generated test data, as recorded.
- [The login example](https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table): a table Claude drafted, column by column, and what it got wrong.
- [Equivalence class tables](https://nanook.xhub.io/docs/guide/equivalence/overview): the concepts, for when you edit what the agent drafted.

---
Index of all docs: https://nanook.xhub.io/llms.txt
