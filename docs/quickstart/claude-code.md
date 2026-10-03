# Quickstart with Claude Code

Source: https://nanook.xhub.io/docs/quickstart/claude-code

Claude Code drafts the decision table, Nanook generates the data. One form, one script, real test data at the end. The table run on this page was made on 2 September 2026 with `@xhubio/nanook-table` 3.0.1, skill version 0.1.0 and Claude Code 2.1.258; the numbers are from that run. The plugin install and the scripts that ship with skill 0.2.0 were checked on 2 October 2026, the plugin installed from a local copy of the repository.

## What you need

- Node.js 22 or newer.
- [Claude Code](https://claude.ai/claude-code), installed and signed in.
- A project directory. You do not need a clone of the nanook-table repository.

## 1 · Install Nanook and the skill

Since skill version 0.2.0 the skill ships as a Claude Code plugin, straight from the GitHub repository. Install it once in Claude Code, then set up the project:

```
/plugin marketplace add xhubio/nanook-table
/plugin install nanook@nanook
```

```
npm init -y
npm pkg set type=module
npm install @xhubio/nanook-table
npm install -D exceljs
```

Without the plugin, copy the skill from the package (any version after 3.0.1) into your project: `mkdir -p .claude/skills && cp -r node_modules/@xhubio/nanook-table/skills/create-equivalence-class-table .claude/skills/`. The run behind this page used 3.0.1, where skill and command were copied from the package’s `.claude` folder.

`exceljs` is what the generated script uses to write a formatted workbook with fills and formulas. It is not a dependency of Nanook itself, so install it once. Two things to know before you start: the skill text is written in German. In the run behind this page (skill 0.1.0) the table’s comments and expected results came out German although the prompt was English; since 0.2.0 the skill is told to write in the language of your request. And the skill assumes a `scripts/` and a `resources/` folder; if you want the files elsewhere, say so in the prompt.

## 2 · Ask for a table

Start Claude Code in the project and run the skill with a name or a one-line description of what you want to test. Installed as a plugin it is `/nanook:create-equivalence-class-table`; copied into `.claude/skills` it is `/create-equivalence-class-table`. The run behind this page used the slash command `/createEquivalenceClassTable` of 3.0.1, a thin wrapper around the same skill.

```
claude
/nanook:create-equivalence-class-table Login Form
```

The skill then works through its steps: analyse the test object, group its fields into one or more tables, define equivalence classes per field, plan one test case per invalid class plus one happy path so that the coverage lands on 100 % (the CASCADE pattern), then write and run a TypeScript script that produces the workbook with `exceljs`, and verify the result through Nanook’s `ImporterXlsx`. The mechanics are described in [AI-Assisted Equivalence Class Tables with Claude Code](https://nanook.xhub.io/blog/2026/03/29/ai-assisted-equivalence-class-tables).

In the run behind this page, `/createEquivalenceClassTable Login Form` with no further input took 17.5 minutes and 56 turns and produced four files. `resources/login-form-tests.xlsx` is the workbook. `scripts/create-login-form-table.ts` builds it with `exceljs` and refuses to write a sheet whose coverage is not 100 %. `scripts/check-login-form-table.ts` reads the markers back out of the file and recounts, independently of the builder. And `scripts/generate-login-form-fixtures.ts` runs Nanook over the workbook and writes one JSON fixture per test case.

The workbook has two sheets, following the skill’s split into a data table and a test-case table. `User` (Execute = F) holds the field email with five classes (valid, empty, whitespace only, invalid format, too long) and password with three (valid, empty, too long); 5 × 3 gives the 15 combinations. `Login` (Execute = T) defines no classes for the form fields itself; it names the base state (logged out, an existing user, a verified address) and the input, and pulls the email and password classes in from `User` by reference. The four invalid emails arrive as one range reference, `ref::User:email:[email_invalid_1-4]`.

| Sheet | Columns | Combinations | Coverage |
|---|---|---|---|
| User | 7 | 15 | 100 % |
| Login | 7 | 48 | 100 % |

One decision Claude took on its own and reported: the empty, whitespace-only and too-long classes use a small generator Claude wrote itself (`gen::text:empty`, `gen::text:spaces:3`, `gen::text:email:250`, `gen::text:alpha:200`) instead of empty cells or Faker, because the importer trims cells, a reference to a class without a generator never resolves, and the built-in Faker generator takes no arguments. The generator is about twenty lines in the fixture script. And one thing it did not report: the comments and expected results are German, because skill 0.1.0 was.

The more you say, the less Claude guesses. A bare “Login Form” got Claude’s idea of a login form, with the assumptions listed at the end of its report: 254 characters for the email, 128 for the password, one `INVALID_CREDENTIALS` for an unknown address and a wrong password alike. Name your fields, limits and error codes in the prompt and those assumptions become yours. Open the workbook in a spreadsheet before you go on: the fills mark the sections, the formulas count the markers per field, and the summary row shows the coverage. The full table from a comparable run, column by column, is in [the login example](https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table).

## 3 · Generate the test data

Since 0.2.0 the skill copies two ready-made scripts into `scripts/`: `check-classes.mts` recounts the coverage from the cells and reports every class without a test case of its own, `generate-fixtures.mts` runs Nanook with the `faker` and `text` generators and writes one JSON per test case. On this run’s workbook, checked on 2 October 2026, they report 100 % for both sheets and 11 fixtures:

```
node scripts/check-classes.mts resources/login-form-tests.xlsx
node scripts/generate-fixtures.mts resources/login-form-tests.xlsx
```

In the 3.0.1 run behind this page there were no bundled scripts yet: Claude wrote its own, `scripts/generate-login-form-fixtures.ts`, and it wrote the same 11 fixtures to `fixtures/login-form/`: the seven columns of `Login`, with the two range references expanded into four and two cases. Node.js 22.18 or newer runs `.ts` files directly; older 22.x needs `--experimental-strip-types`, and `npx tsx` works everywhere.

If you would rather have one script for every table, the one from the [5 minute Quickstart](https://nanook.xhub.io/docs/quickstart/quickstart) works too. Save it as `generate.mts`, point it at the workbook, and register the generators the table calls for; this workbook needs `text` next to `faker`. The tables are handed to the processor keyed by name, which is what lets a reference find the other sheet:

```
import {
  LoggerMemory, FileProcessor, ImporterXlsx,
  ParserDecision, DataGeneratorRegistry, GeneratorFaker,
  TestcaseProcessor, type InterfaceWriter
} from '@xhubio/nanook-table'

const logger = new LoggerMemory()
logger.writeConsole = true

const fileProcessor = new FileProcessor({ logger })
fileProcessor.registerImporter(
  'xlsx',
  new ImporterXlsx()
)
fileProcessor.registerParser(
  '<DECISION_TABLE>',
  new ParserDecision({ logger })
)
await fileProcessor.load(['resources/login-form-tests.xlsx'])

const registry = new DataGeneratorRegistry()
registry.registerGenerator(
  'faker',
  new GeneratorFaker({ logger })
)
// plus the 'text' generator from
// scripts/generate-login-form-fixtures.ts
const collected: unknown[] = []
const writer: InterfaceWriter = {
  logger,
  async before() {},
  async write(tc) {
    collected.push(JSON.parse(JSON.stringify(tc)))
  },
  async after() {},
}

const tables = Object.fromEntries(
  fileProcessor.tables.map((t) => [t.tableName, t])
)

const processor = new TestcaseProcessor({
  logger,
  tables,
  generatorRegistry: registry,
  writer: [writer],
})
await processor.process()

console.log(collected.length, 'test cases')
console.log(JSON.stringify(collected[0], null, 2))
```

With the Faker generator alone, this script reported 5 test cases on the run’s workbook and two errors, `There was no generator registered with the name 'text'`. With Claude’s `text` generator registered as well, it reported 11, with no errors and no warnings.

**Check the number.** The table has one column per test case, and a range reference adds one case per extra element: 7 columns and two ranges make 11 here. The script must report exactly that number. Fewer means a generator failed on the way: Nanook logs the error and keeps going, and the missing case is easy to overlook. The login example shows the most common cause and [the ten-line fix](https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table#when-faker-is-not-enough).

## What can go wrong

- **Fewer cases than columns.** A Faker directive with an argument, such as `gen:1:faker:string.alpha:255`, fails because the built-in generator takes a Faker path and nothing else. Write a small generator that extends `DataGeneratorBase` and register it under its own name; see [Create data generator](https://nanook.xhub.io/docs/tutorials/createGenerator).
- **`Cannot find module 'exceljs'`.** The generated script needs it in your project: `npm install -D exceljs`.
- **Files land in `scripts/` and `resources/`.** That is the skill’s default. Name the folders you want in the prompt, or move the files and change the path in `generate.mts`.
- **`Method not implemented` from the default writer.** Up to 3.2.x the writer returned by `createDefaultWriter` throws in `before()`. Use an inline writer as above, or your own class; from 3.3.0 the default writer works.
- **`The targetTable 'User' does not exists`.** You handed `fileProcessor.tables`, an array in 3.0.1, to `TestcaseProcessor`. Every `ref:` then fails with this message and fewer cases come out, 7 instead of 11 in the run. Pass the tables keyed by name, as the script above does.

## No terminal?

According to the Claude Code documentation, the desktop app and [claude.ai/code](https://claude.ai/code) read project skills from the same `.claude` folder, so a tester could ask for the table there and hand the workbook to whoever runs the generation. We have not run this page’s steps there, and generating the data still needs Node.js.

## Where to go next

- [The login example](https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table): the full table, the generated data, and what the skill got wrong.
- [AI-Assisted Equivalence Class Tables](https://nanook.xhub.io/blog/2026/03/29/ai-assisted-equivalence-class-tables): how the skill works and what CASCADE coverage is.
- [Create an equivalence class table from scratch](https://nanook.xhub.io/docs/tutorials/createEquivalenceClassTable): the markers by hand, for when you edit what Claude drafted.
- [Equivalence class tables](https://nanook.xhub.io/docs/guide/equivalence/overview) in the guide, and the [directives reference](https://github.com/xhubio/nanook-table/blob/master/docs/guide/directives.md) in the repository for `gen:` and `ref:`.
- [Testing a SaaS with Nanook](https://nanook.xhub.io/blog/2026/08/21/testing-a-saas-with-nanook): what this looks like at 117 tables.

*Run record: 2 September 2026, Node.js 24.16.0, @xhubio/nanook-table 3.0.1 with skill version 0.1.0, Claude Code 2.1.258 in headless mode, 56 turns, 17.5 minutes. The workbook, the three scripts and a fixture are kept with the site’s sources.*

---
Index of all docs: https://nanook.xhub.io/llms.txt
