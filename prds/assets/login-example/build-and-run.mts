/**
 * Erzeugt die Login-Entscheidungstabelle und laesst sie durch Nanook laufen.
 * Wegwerf-Skript fuer den Blogbeitrag — es soll belegen, dass Tabelle UND
 * erzeugte Daten im Artikel echt sind und nicht ausgedacht.
 */
import path from 'node:path'
import fs from 'node:fs'
import XLSX from 'xlsx'
import { LoggerMemory } from './src/logger/index.js'
import { ImporterXlsx } from './src/importer-xlsx/index.js'
import { FileProcessor, ParserDecision } from './src/file-processor/index.js'
import { DataGeneratorRegistry, GeneratorFaker } from './src/data-generator/index.js'
import { TestcaseProcessor } from './src/processor/index.js'
import { DataGeneratorBase } from './src/data-generator/index.js'
import type { DataGeneratorGenerateRequest } from './src/data-generator/index.js'

/**
 * `gen::len:255` → eine Zeichenkette aus genau 255 'a'.
 *
 * 🔴 Warum das noetig ist: Faker-Pfade nehmen KEINE Argumente — der Aufrufer macht
 * `args.split('.')` und ruft den Pfad auf. `string.alpha:255` landet damit als
 * Schluessel `alpha:255` und wirft. Fuer eine exakte Grenze schreibt man deshalb
 * zehn Zeilen eigenen Generator statt die Zahl zu erfinden.
 */
class GeneratorLen extends DataGeneratorBase {
  // eslint-disable-next-line require-await
  async doGenerate(request: DataGeneratorGenerateRequest) {
    const cfg = request.generatorDirective?.config
    const count = Number.parseInt(String(cfg ?? '').replace(/^len:/, ''), 10)
    return Number.isFinite(count) ? 'a'.repeat(count) : undefined
  }
}
import type { InterfaceWriter } from './src/processor/index.js'

const OUT = path.join(import.meta.dirname, 'zz-login.xlsx')

// ─── 1 · Die Tabelle ───────────────────────────────────────────────────────
type Row = (string | number)[]
const CASES = [
  'OK_login',
  'E_emailEmpty',
  'E_emailNoAt',
  'E_emailTooLong',
  'E_passwordEmpty',
  'E_passwordTooShort',
  'E_unknownUser',
  'E_lockedUser',
]
const n = CASES.length
const pad = (m: Record<number, string>): Row => {
  const out: Row = []
  for (let i = 0; i < n; i++) out.push(m[i] ?? '')
  return out
}
const sec = (t: string, type: string): Row => [t, type, '', '', '', ...Array(n).fill('')]
const row = (name: string, gen: string, rem: string, m: Record<number, string>): Row => [
  '', '', name, gen, rem, ...pad(m),
]

const rows: Row[] = [
  ['<DECISION_TABLE>', '', '', '', '', ...CASES],
  ['Execute', 'ExecuteSection', '', '', '', ...Array(n).fill('T')],
  ['Multiplicity', 'MultiplicitySection', '', '', '', ...Array(n).fill('1')],

  sec('Secondary data — what must already exist', 'FieldSection'),
  sec('account', 'FieldSubSection'),
  row('exists, active', 'active', 'the normal world',         { 0:'x', 1:'x', 2:'x', 3:'x', 4:'x', 5:'x' }),
  row('does not exist', 'absent', 'nobody registered that',   { 6:'x' }),
  row('locked',         'locked', 'too many failed attempts', { 7:'x' }),

  sec('Primary data — the login form', 'FieldSection'),
  sec('email', 'FieldSubSection'),
  row('valid',    'gen:1:faker:internet.email', '',            { 0:'x', 4:'x', 5:'x', 6:'a', 7:'a' }),
  row('empty',    '',                            'min(1)',      { 1:'x', 6:'e', 7:'e' }),
  row('no @',     'torsten.link',                'format',      { 2:'x', 6:'e', 7:'e' }),
  row('too long', 'gen::len:255',                'max(254) RFC 5321', { 3:'x', 6:'e', 7:'e' }),

  sec('password', 'FieldSubSection'),
  row('valid',     'gen:1:faker:internet.password', '',        { 0:'x', 1:'a', 2:'a', 3:'a', 6:'a', 7:'a' }),
  row('empty',     '',                              'min(1)',   { 4:'x', 1:'e', 2:'e', 3:'e', 6:'e', 7:'e' }),
  row('too short', 'ab',                            'min(8)',   { 5:'x', 1:'e', 2:'e', 3:'e', 6:'e', 7:'e' }),

  sec('Summary', 'SummarySection'),
  sec('Expected reaction', 'MultiRowSection'),
  row('signed in', '', 'session cookie is set', { 0:'x' }),
  row('rejected',  '', 'with a message',        { 1:'x', 2:'x', 3:'x', 4:'x', 5:'x', 6:'x', 7:'x' }),
  sec('Expected effect', 'MultiRowSection'),
  row('failed-attempt counter rises', '', 'real account, wrong password', { 5:'x' }),
  row('failed-attempt counter unchanged', '',
      'success or unknown user',
      { 0:'x', 6:'x' }),
  ['<END>', '', '', '', '', ...Array(n).fill('')],
]

const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Login')
XLSX.writeFile(wb, OUT)
console.log(`Tabelle geschrieben: ${CASES.length} Faelle`)

// ─── 2 · Durchlaufen lassen ────────────────────────────────────────────────
const LOGGER = new LoggerMemory()
const fp = new FileProcessor({ logger: LOGGER })
fp.registerImporter('xlsx', new ImporterXlsx())
fp.registerParser('<DECISION_TABLE>', new ParserDecision({ logger: LOGGER }))
await fp.load([OUT])

if (LOGGER.entries.error?.length) {
  console.log('FEHLER beim Parsen:', JSON.stringify(LOGGER.entries.error, null, 1).slice(0, 900))
  process.exit(1)
}

const registry = new DataGeneratorRegistry()
registry.registerGenerator('faker', new GeneratorFaker({ logger: LOGGER }))
registry.registerGenerator('len', new GeneratorLen({ logger: LOGGER, name: 'len' }))

const collected: unknown[] = []
const writer: InterfaceWriter = {
  logger: LOGGER,
  async before() {},
  async write(tc) { collected.push(JSON.parse(JSON.stringify(tc))) },
  async after() {},
}

const proc = new TestcaseProcessor({
  logger: LOGGER,
  tables: fp.tables,
  generatorRegistry: registry,
  writer: [writer],
})
await proc.process()

fs.writeFileSync(
  path.join(import.meta.dirname, 'zz-login-output.json'),
  JSON.stringify(collected, null, 2)
)
console.log(`Erzeugte Testfaelle: ${collected.length}`); console.log("WARN:", JSON.stringify(LOGGER.entries.warn??[]).slice(0,700)); console.log("ERR:", JSON.stringify(LOGGER.entries.error??[]).slice(0,700))
console.log(JSON.stringify(collected[0], null, 1).slice(0, 1200))
