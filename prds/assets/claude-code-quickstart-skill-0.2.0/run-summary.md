# Headless run with skill 0.2.0, 2026-10-02

Prompt: `/nanook:create-equivalence-class-table Login Form` (`claude -p`, `--permission-mode acceptEdits`,
`--plugin-dir` on branch `feat/ai-integration` of xhubio/nanook-table, commit 910c4ef)
Turns: 38, duration: 9.6 min, cost: US$ 5.05 (list price), Claude Code 2.1.287, Node 24.16.0,
@xhubio/nanook-table 3.0.1 + exceljs 4.4.0, empty project without `.claude/`

## Compared with the run of 2026-09-02 (skill 0.1.0)

| | 2026-09-02, skill 0.1.0 | 2026-10-02, skill 0.2.0 |
|---|---|---|
| Invocation | `/createEquivalenceClassTable` (copied into `.claude/`) | `/nanook:create-equivalence-class-table` (plugin) |
| Turns, duration, cost | 56, 17.5 min, US$ 10.15 | 38, 9.6 min, US$ 5.05 |
| Sheets | User (Execute F) + Login (Execute T) | User (Execute F) + Login (Execute T) |
| User | 7 columns, 15 combinations, 100 % | 6 columns, 12 combinations, 100 % |
| Login | 7 columns, 48 combinations, 100 % | 5 columns, 16 combinations, 100 % |
| Fixtures | 11 | 9 (5 columns + 4 extra from `[invalid_1-5]`), as Claude predicted |
| Edge-case values | own `text` generator, written by Claude | `gen::text:empty`, `gen::text:email:243`, `gen::text:alpha:129`: the bundled generator |
| Scripts ran in the session | yes | no: every `node` and `cp` call was refused (headless, acceptEdits) |

## Checked afterwards, by hand

- `node scripts/create-login-table.ts`: writes `resources/login-tests.xlsx`, exit 0.
- The bundled `check-classes.mts`, run against the workbook: User 12/12, Login 16/16, every class has its own `x`, exit 0.
- The bundled `generate-fixtures.mts`: Login 9 test cases, no errors, no warnings, exit 0.
- No faker call with arguments, no `<NOTHING>`; empty generator cells only for pure states (`abgemeldet`, `nein`).
- Claude's open question resolved: `ref:2:User:password:valid_1` fills `abweichendesPasswort` with the password of a second user instance, different from the registered user's (see `fixture-falschesPasswort.json`).

## Findings

1. **Scripts rewritten instead of copied.** With `cp` refused, Claude wrote its own `check-classes.mts` and `generate-fixtures.mts` under the same names; they differ from the bundled ones. Fixed in SKILL.md (not yet committed): if `cp` is not allowed, read the file and write it unchanged.
2. **Language rule not testable here.** Comments, error messages and the final message are German. The user's `~/.claude/settings.json` has `"language": "German"`, which also applies to `claude -p`, and the prompt "Login Form" is a weak language signal. The run neither confirms nor refutes the rule "write in the language of the request".
3. **German field and class names** (`sitzung`, `eingabe`, `gueltig`, `abgemeldet`) come from the German example in SKILL.md; consistent with the German setting, but an English user would likely get them too.

## Files

`login-tests.xlsx` (the workbook), `create-login-table.ts` (Claude's builder), `fixture-falschesPasswort.json` (one fixture from the bundled generator).
