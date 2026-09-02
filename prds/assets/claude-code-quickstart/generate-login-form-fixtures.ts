/**
 * Lässt Nanook die Mappe resources/login-form-tests.xlsx lesen und erzeugt die Fixtures der
 * Testfall-Tabelle 'Login'. Die Datentabelle 'User' (Execute = F) wird nur referenziert.
 *
 * Ausgabe: fixtures/login-form/<Testfall>.json
 *          Bereichsreferenzen ergeben mehrere Fixtures: <Testfall>-1, <Testfall>-2, …
 *
 * Fixture-Aufbau (Auszug):
 *   data.Login.<instanz>   session, existingUser, emailVerified, email, password, rememberMe,
 *                          'Expected Result' (Code-Zeile der Login-Tabelle)
 *   data.User.<instanz>    email, password, 'Expected Result' der referenzierten User-Instanz(en)
 *   callTree               welche User-Testfälle referenziert wurden
 *
 * Generatoren:
 *   faker   gen:<id>:faker:<modul>.<funktion>     z.B. gen:1:faker:internet.email (ohne Argumente)
 *   text    gen::text:empty | spaces:N | alpha:N | email:N
 *
 * Nanook wirft bei unaufgelösten Referenzen nicht, es loggt nur und gibt den Testfall trotzdem aus.
 * Deshalb wird der Logger nach dem Lauf ausgewertet; bei Fehlern endet das Script mit Exit-Code 1.
 *
 * Aufruf: node scripts/generate-login-form-fixtures.ts [--verbose]
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import {
  LoggerMemory,
  TestcaseProcessor,
  GeneratorFaker,
  DataGeneratorBase,
  DataGeneratorRegistry,
  createDefaultFileProcessor
} from '@xhubio/nanook-table'
import type {
  InterfaceWriter,
  TestcaseDataInterface,
  DataGeneratorGenerateRequest,
  TableInterface,
  CallTreeInterface
} from '@xhubio/nanook-table'

const XLSX_FILE = path.resolve(import.meta.dirname, '..', 'resources', 'login-form-tests.xlsx')
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'fixtures', 'login-form')
const VERBOSE = process.argv.includes('--verbose')

// ------------------------------------------------------------------
// Generator 'text': Randfälle, die Faker ohne Argumente nicht liefert
// ------------------------------------------------------------------

function randomAlpha(n: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz'
  let s = ''
  for (let i = 0; i < n; i++) s += letters[Math.floor(Math.random() * letters.length)]
  return s
}

class GeneratorText extends DataGeneratorBase {
  protected doGenerate(request: DataGeneratorGenerateRequest): Promise<string> {
    const config = request.generatorDirective?.config ?? ''
    const [kind, arg] = config.split(':')
    const n = Number.parseInt(arg ?? '0', 10)
    switch (kind) {
      case 'empty':
        return Promise.resolve('')
      case 'spaces':
        return Promise.resolve(' '.repeat(n))
      case 'alpha':
        return Promise.resolve(randomAlpha(n))
      case 'email':
        return Promise.resolve(`${randomAlpha(n)}@example.com`)
      default:
        return Promise.reject(new Error(`Generator 'text': unbekannte Anweisung '${config}'`))
    }
  }
}

// ------------------------------------------------------------------
// Writer: ein JSON je Fixture
// ------------------------------------------------------------------

class FixtureWriter implements InterfaceWriter {
  logger: LoggerMemory
  written: TestcaseDataInterface[] = []

  constructor(logger: LoggerMemory) {
    this.logger = logger
  }

  async before(): Promise<void> {
    await fs.mkdir(OUT_DIR, { recursive: true })
    // Nur die eigenen Ausgaben entfernen, das Verzeichnis bleibt bestehen
    for (const entry of await fs.readdir(OUT_DIR)) {
      if (entry.endsWith('.json')) await fs.rm(path.join(OUT_DIR, entry))
    }
  }

  async write(testcaseData: TestcaseDataInterface): Promise<void> {
    const file = path.join(OUT_DIR, `${testcaseData.name}.json`)
    await fs.writeFile(file, JSON.stringify(testcaseData, null, 2))
    this.written.push(testcaseData)
  }

  after(): Promise<void> {
    return Promise.resolve()
  }
}

// ------------------------------------------------------------------
// Ausgabe
// ------------------------------------------------------------------

function referencedTestcases(tree: CallTreeInterface): string[] {
  return tree.children.flatMap((c) => [`${c.tableName}:${c.testcaseName}`, ...referencedTestcases(c)])
}

function short(value: unknown): string {
  if (value === undefined) return '—'
  const s = typeof value === 'string' ? value : JSON.stringify(value)
  return s.length > 24 ? `${s.slice(0, 20)}…(${s.length})` : s
}

function expectedKeys(instance: Record<string, unknown> | undefined): string {
  const rows = (instance?.['Expected Result'] ?? []) as Array<{ key: string }>
  return rows.map((r) => r.key).join(',') || '—'
}

function printFixture(tc: TestcaseDataInterface) {
  const own = (tc.data[tc.tableName]?.[tc.instanceId] ?? {}) as Record<string, unknown>
  const users = Object.values((tc.data.User ?? {}) as Record<string, Record<string, unknown>>)
  console.log(`\n${tc.name}`)
  console.log(`  Referenzen:    ${referencedTestcases(tc.callTree).join(', ') || '—'}`)
  console.log(
    `  Basiszustand:  session=${short(own.session)}  existingUser=${short(own.existingUser)}  emailVerified=${short(own.emailVerified)}`
  )
  console.log(
    `  Eingabe:       email=${short(own.email)}  password=${short(own.password)}  rememberMe=${short(own.rememberMe)}`
  )
  console.log(`  Erwartung:     Login=${expectedKeys(own)}  User=${users.map(expectedKeys).join(' | ') || '—'}`)
}

// ------------------------------------------------------------------
// main
// ------------------------------------------------------------------

async function main() {
  const logger = new LoggerMemory({ writeConsole: VERBOSE })

  const fileProcessor = createDefaultFileProcessor(logger)
  await fileProcessor.load([XLSX_FILE])
  const tables: Record<string, TableInterface> = {}
  for (const table of fileProcessor.tables) tables[table.tableName] = table
  if (Object.keys(tables).length === 0) {
    throw new Error(`Keine Tabelle aus ${XLSX_FILE} geladen`)
  }
  console.log(`Geladen: ${Object.keys(tables).join(', ')}`)

  const registry = new DataGeneratorRegistry()
  registry.registerGenerator('faker', new GeneratorFaker({ generatorRegistry: registry, name: 'faker', logger }))
  registry.registerGenerator('text', new GeneratorText({ generatorRegistry: registry, name: 'text', logger }))

  const writer = new FixtureWriter(logger)
  const processor = new TestcaseProcessor({ logger, generatorRegistry: registry, writer: [writer], tables })
  await processor.process()

  for (const tc of writer.written) printFixture(tc)

  const warnings = logger.entries.warning
  const errors = logger.entries.error
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} Warnung(en):`)
    for (const w of warnings) console.log(JSON.stringify(w))
  }
  if (errors.length > 0) {
    console.error(`\n${errors.length} Fehler beim Generieren:`)
    for (const e of errors) console.error(JSON.stringify(e, null, 2))
    process.exit(1)
  }
  console.log(`\n${writer.written.length} Fixtures nach ${path.relative(process.cwd(), OUT_DIR)} geschrieben`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err)
  process.exit(1)
})
