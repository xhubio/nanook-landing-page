# Upstream memo: make the Claude Code skill usable outside the repository

| Field | Value |
|---|---|
| **For** | github.com/xhubio/nanook-table (carried over by hand; nothing here changes that repo) |
| **From** | nanook-landing-page, 2026-09-02, while building `/docs/quickstart/claude-code` |
| **State checked** | @xhubio/nanook-table 3.0.1 (npm `latest`, 2026-08-29), master commit 47266695abbc, skill `create-equivalence-class-table` version 0.1.0 |

## Why

The site now documents a "Quickstart with Claude Code" that works **today** without any
upstream change: the npm tarball publishes the whole repository (no `files` field, no
`.npmignore`), so `node_modules/@xhubio/nanook-table/.claude/skills/create-equivalence-class-table/SKILL.md`
and `.claude/commands/createEquivalenceClassTable.md` exist after `npm install`, and a
`cp -r` into the project's `.claude/` folder makes them a project skill and command. That
path is fragile (it depends on an accident of packaging) and the skill itself was written
for one private project. The items below are ordered by what the site depends on.

## P1 — the site depends on these

| # | Change | Site depends on it |
|---|---|---|
| 1.1 | **Keep the skill and command in the npm tarball.** If a `files` whitelist or `.npmignore` is ever added (it should be: the tarball currently ships `tests/`, dev-process skills, `.releaserc.json`), it must include `.claude/skills/create-equivalence-class-table/**` and `.claude/commands/createEquivalenceClassTable.md`, or the documented `cp -r` path breaks. Better: ship the skill in a dedicated `claude-plugin/` directory (P3) **and** keep the copy path working until the plugin is documented. | **yes** |
| 1.2 | **Fix the README quick-start.** On 3.0.1 `writer: [createDefaultWriter(logger)]` wraps an array in an array (`TestcaseProcessor` expects `InterfaceWriter[]` and calls `writer.before()`), and the default writer throws `Method not implemented` in `before()`. The site's quickstart and the skill quickstart use an inline writer instead. | yes (the site links the README) |

## P2 — skill 0.2.0: make it a public skill

The body may stay German (Claude reads it either way); the frontmatter should be English.

- **Frontmatter**: English `description` that leads with the use case ("Draft a Nanook
  decision table (equivalence classes, test cases, CASCADE coverage) as a formatted XLSX for
  a form, page or API"), English trigger phrases, `version: 0.2.0`. Keep the German
  triggers as additional phrases.
- **Remove private references**: the "Referenz-Beispiel Script"
  `saas-coding-kernel/repo/tools/playwright-test-definition/scripts/create-invoice-table.ts`
  (not public); the tool `check-klassen` (not in the package; see the bundled script below);
  the generators `gen::vorlage:` and `gen::mail:` (do not exist in nanook-table; the package
  ships `GeneratorFaker` only, and it is not registered by default) — either mark them
  "custom generators of one project, not in the package" or ship them as example generators.
- **Move the dated working notes** ("Festlegung Torsten, 2026-08-15", "ich hatte hier zuerst
  das Gegenteil geschrieben", the measured anecdotes) into a `notes.md` next to the skill.
  They are valuable, but a skill is instructions, not a diary; the model reads all of it on
  every invocation.
- **Explain `<NOTHING>`** (used in the registration example) or replace it with an empty cell.
- **Declare the environment**: the generated script needs `exceljs` (not a dependency of the
  package); the default layout `scripts/create-<name>-table.ts` and
  `resources/<name>-tests.xlsx` is a default the user may override in the prompt; Node ≥ 22.18
  runs `.ts`/`.mts` directly (older 22.x needs `--experimental-strip-types`), `npx tsx` is optional.
- **Bundle two scripts** under `scripts/`, referenced via `${CLAUDE_SKILL_DIR}`:
  `generate-fixtures.mts` (FileProcessor + ImporterXlsx + ParserDecision, registry with
  `faker`, an inline `InterfaceWriter` because the default writer throws, prints the case
  count and the logger's warnings and errors) and `check-classes.mts` (the twenty-line check
  "does every equivalence class have its own `x`", counting only `x`). Both are what the
  site's Claude Code quickstart and the blog post "Writing Tests Got Cheap" (2026-09-02) describe; today every user re-derives them.
- **One contradiction to resolve**: "Happy-Path TC, Nicht-Zielfeld: NUR die gueltige
  EqClass mit `x`" (Marker-Regeln, rule 2) versus "`e` im Gutfall heisst 'mir egal' — und das
  ist erlaubt" (later section). State which one wins, and when.

## P3 — distribution as a Claude Code plugin

Claude Code installs skills from plugins; a repository becomes a marketplace with one file.

```
claude-plugin/nanook/.claude-plugin/plugin.json        name, description, version, author
claude-plugin/nanook/skills/create-equivalence-class-table/SKILL.md   (moved or copied)
claude-plugin/nanook/skills/create-equivalence-class-table/scripts/…
.claude-plugin/marketplace.json                        { "name": "nanook", "owner": {…},
                                                         "plugins": [{ "name": "nanook-table",
                                                         "source": "./claude-plugin/nanook", … }] }
```

User path: `/plugin marketplace add xhubio/nanook-table`, then
`/plugin install nanook-table@nanook`; the skill appears as `/nanook:create-equivalence-class-table`.
Works in the CLI, the desktop app, claude.ai/code and the IDE extensions. The dev-process
skills (brainstorming, TDD, …) stay in `.claude/skills/`; contributors run
`claude --plugin-dir ./claude-plugin/nanook` or keep the project-skill copy. When this ships,
the site page gets a second "Install" variant; nothing else on the site changes.

## P4 — documentation

- README section **"Use with Claude Code"** (three commands, one sentence on what the skill
  produces, link to the site quickstart) and a `docs/guide/claude-code.md`.
- CHANGELOG: the 2.1.0 entry reads "add a skill and commnd for claude"; a release note for
  0.2.0 of the skill should say what changed.
- `AGENTS.md`: "Documentation website: nanook.io" → `https://nanook.xhub.io`.
- `docs/README.md` imports from `'nanook-table'`; the package is `@xhubio/nanook-table`.
- No `LICENSE` file in the repository (package.json says MIT; GitHub shows none).

## What the site says today (so upstream knows what it is committed to)

`/docs/quickstart/claude-code` documents: `npm install @xhubio/nanook-table`,
`npm install -D exceljs`, the `cp -r` of skill and command from `node_modules`,
`/createEquivalenceClassTable Login Form`, and the site's `generate.mts` with an inline
writer. The run behind the page is recorded in `prds/2026-09-02_docs-quickstart-claude-code.md`.
