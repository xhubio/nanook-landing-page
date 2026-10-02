# The 5 minute Quickstart

Source: https://nanook.xhub.io/docs/quickstart/quickstart

This is a tutorial on Nanook – test case generator. It will take you through a basic overview and examples including simple test data generator setup. You’ll find detailed description of the tool in our full tutorial and user manual.

Prefer to have the first table drafted for you? The [Quickstart with Claude Code](https://nanook.xhub.io/docs/quickstart/claude-code) lets Claude Code write the decision table from a one-line description; the data is then generated with the same script as below.

## Equivalence Class Table

Test cases are defined in an ECT - Equivalence Class Table, which refers to the concept of classes with equivalent behavior within a single application. For example, the "Not Empty Field" class behavior is the same regardless of type and number of characters provided. The ECT can be created with any spreadsheet application that saves XLSX files — Excel, LibreOffice Calc, or Google Sheets via download.

In this Quickstart we’ll look at the example of a simple log-in dialogue. The ECT representing a login dialogue is shown below.

![equivalence class table quickstart](https://nanook.xhub.io/img/quickstart/equivalence-class-table-quickstart.png)

In the log-in dialogue the user provides username and password and each may have three groups of possible values corresponding to the following ECT classes:

For the user-id field the classes are:

- empty
- userId not existent
- valid user id

Classes related to the password field:

- empty
- wrong
- valid password

These classes will result in a maximum of 3*3=9 test cases. In this example we would like to generate test data for all of these test cases.

The test case definitions are provided in columns "F" to "J" in the above spreadsheet. If we take a closer look at test case 1 (column F), we see that the equivalence class "empty" for "userId" is marked with an "x". An "x" means: "choose exactly this equivalence class for this field". The three equivalence classes for the password field are marked with an "e". "e" means: "randomly choose any of the equivalence classes for this field". In the summary section, you can see the expected result for this test case. The test case should make sure that no matter what you enter into the password field, the error "The userId must not be empty" appears, as long as the userId is empty.

Columns G to J define the other test cases we would like to cover.

## Generating test data

Finally, let's generate the test data on the basis of the table we just created. Install the package into a Node.js project (Node.js 22 or newer):

```
npm install @xhubio/nanook-table
```

Save the table as `resources/login.xlsx`, save the script below as `generate.mts` and run it with `node generate.mts` (Node.js 22.18 or newer runs `.mts` files directly; older 22.x needs `--experimental-strip-types`). It uses the same calls as the example that produced the data on the start page. The tables are handed to the processor keyed by name; that is what lets `ref:` directives find another sheet of the workbook:

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
await fileProcessor.load(['resources/login.xlsx'])

const registry = new DataGeneratorRegistry()
registry.registerGenerator(
  'faker',
  new GeneratorFaker({ logger })
)

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

console.log(JSON.stringify(collected[0], null, 2))
```

The pictured table calls a generator named `generatorPerson` in the class "userId not existent". Either register a generator under that name or change that cell to `gen::faker:internet.email`, which the script registers. Parsing and generation errors are printed, because the logger writes to the console.

The original example repository `quickstart-source` from 2019 is archived (last change November 2020) and targets Nanook 1.x; its `yarn install` and `node src/quickstart.js` steps no longer apply.

The script collects one record per test case — the five test cases defined in columns F to J, out of the nine possible combinations. Nanook's default writer would instead store each one as `tdg/<name>/testcaseData.json` ("tdg" for Test Data Generation). Which data a record holds follows the "Generator Function" column of the ECT: static data, as for the class "valid user id", or generated data through a generator directive, as for the class "userId not existent". The script registers the built-in Faker generator under the name `faker`; a custom generator like the GeneratorPerson of the original example is a TypeScript class that extends `DataGeneratorBase`.

Ready to learn more? Check out the [full tutorials](https://nanook.xhub.io/docs/tutorials/overview) or read the [Nanook Table overview](https://nanook.xhub.io/docs/guide/generalOverview).

---
Index of all docs: https://nanook.xhub.io/llms.txt
