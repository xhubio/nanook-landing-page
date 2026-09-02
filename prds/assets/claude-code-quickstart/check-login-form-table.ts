/**
 * Prüft eine Nanook-Decision-Table-Mappe unabhängig vom Erzeuger-Script.
 *
 *  - liest die Marker aus den Zellen (nicht die gecachten Formelwerte)
 *  - rechnet Kombinationen, Spaltenprodukte, Summe und Deckung selbst nach
 *  - meldet jede Klasse ohne eigenes 'x' (a/e sind eine Auswahl, keine Zusicherung)
 *  - meldet jede Spalte, in der ein Feld gar keinen Marker hat (Summary zeigt dort 0)
 *
 * Aufruf:  node scripts/check-login-form-table.ts [datei.xlsx]
 * Exit 1, wenn eine Tabelle nicht 100 % erreicht, eine Klasse kein 'x' hat oder die Datei
 * keine einzige Decision Table enthält (leeres Ergebnis darf nicht wie "alles gut" aussehen).
 */
import path from 'node:path'
import ExcelJS from 'exceljs'

const FIRST_TC_COL = 6 // Spalte F
const KNOWN_MARKERS = new Set(['', 'x', 'a', 'e', 'i'])

function plain(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'object') {
    if ('formula' in value) return plain((value as ExcelJS.CellFormulaValue).result as ExcelJS.CellValue)
    if ('richText' in value) return (value as ExcelJS.CellRichTextValue).richText.map((t) => t.text).join('')
    if ('text' in value) return String((value as ExcelJS.CellHyperlinkValue).text)
    return ''
  }
  return String(value).trim()
}

interface ClassInfo {
  name: string
  markers: string[] // je Testfall
}
interface FieldInfo {
  name: string
  classes: ClassInfo[]
}
interface SheetInfo {
  tcs: string[]
  fields: FieldInfo[]
}

function readSheet(ws: ExcelJS.Worksheet): SheetInfo | undefined {
  if (plain(ws.getCell(1, 1).value) !== '<DECISION_TABLE>') return undefined

  const tcs: string[] = []
  for (let c = FIRST_TC_COL; ; c++) {
    const name = plain(ws.getCell(1, c).value)
    if (name === '') break
    tcs.push(name)
  }

  const fields: FieldInfo[] = []
  let current: FieldInfo | undefined
  for (let r = 2; r <= ws.rowCount; r++) {
    const a = plain(ws.getCell(r, 1).value)
    const b = plain(ws.getCell(r, 2).value)
    const c = plain(ws.getCell(r, 3).value)
    if (a === '<END>') break
    if (b === 'FieldSubSection') {
      current = { name: a, classes: [] }
      fields.push(current)
      continue
    }
    if (b !== '') {
      current = undefined // andere Sektion (FieldSection, Summary, MultiRow, Tag, ...)
      continue
    }
    if (current !== undefined && c !== '') {
      current.classes.push({
        name: c,
        markers: tcs.map((_, i) => plain(ws.getCell(r, FIRST_TC_COL + i).value).toLowerCase())
      })
    }
  }
  return { tcs, fields }
}

function checkSheet(name: string, sheet: SheetInfo): boolean {
  const { tcs, fields } = sheet
  const problems: string[] = []

  const total = fields.reduce((acc, f) => acc * f.classes.length, 1)
  const products = tcs.map((_, i) =>
    fields.reduce((acc, f) => acc * f.classes.filter((cl) => cl.markers[i] !== '').length, 1)
  )
  const sum = products.reduce((a, b) => a + b, 0)

  for (const f of fields) {
    for (const cl of f.classes) {
      if (!cl.markers.some((m) => m === 'x')) problems.push(`Klasse ohne eigenes 'x': ${f.name}.${cl.name}`)
      cl.markers.forEach((m, i) => {
        if (!KNOWN_MARKERS.has(m)) problems.push(`Unbekannter Marker '${m}' in ${tcs[i]} / ${f.name}.${cl.name}`)
      })
    }
  }
  tcs.forEach((tc, i) => {
    for (const f of fields) {
      if (f.classes.every((cl) => cl.markers[i] === '')) problems.push(`Spalte '${tc}': Feld '${f.name}' ohne Marker`)
    }
  })
  if (sum !== total) problems.push(`Deckung ${sum}/${total}, erwartet ${total}`)

  console.log(`\n${name}: ${fields.length} Felder, ${tcs.length} Spalten`)
  console.log(`  Kombinationen: ${fields.map((f) => f.classes.length).join(' × ')} = ${total}`)
  tcs.forEach((tc, i) => console.log(`  ${tc.padEnd(20)} ${String(products[i]).padStart(4)}`))
  console.log(`  ${'Summe'.padEnd(20)} ${String(sum).padStart(4)}   = ${((100 * sum) / total).toFixed(2)} %`)
  for (const p of problems) console.log(`  PROBLEM: ${p}`)
  return problems.length === 0
}

async function main() {
  const file = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.resolve(import.meta.dirname, '..', 'resources', 'login-form-tests.xlsx')

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(file)

  let ok = true
  let count = 0
  for (const ws of workbook.worksheets) {
    const sheet = readSheet(ws)
    if (sheet === undefined) continue
    count++
    if (!checkSheet(ws.name, sheet)) ok = false
  }

  if (count === 0) {
    console.error(`Keine Decision Table in ${file} gefunden`)
    process.exit(1)
  }
  console.log(ok ? '\nAlle Tabellen: 100 % Deckung, jede Klasse hat ein eigenes x.' : '\nPrüfung fehlgeschlagen.')
  process.exit(ok ? 0 : 1)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
