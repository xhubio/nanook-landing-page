/**
 * Erzeugt resources/login-tests.xlsx mit zwei Nanook Decision Tables:
 *
 *   User   (Execute = F)  Datentabelle: Eingabeklassen für E-Mail und Passwort
 *   Login  (Execute = T)  Testfall-Tabelle: Abläufe der Anmeldung, holt User per Referenz
 *
 * Beide Tabellen sind nach dem CASCADE-Muster markiert und erreichen 100 % Deckung.
 *
 * Aufruf: node scripts/create-login-table.ts
 */
import fs from 'node:fs/promises'
import ExcelJS from 'exceljs'

// ---------------------------------------------------------------------------
// Datenmodell
// ---------------------------------------------------------------------------

interface EqClass {
  name: string
  /** Generator, Referenz oder statischer Wert; leer = Feld bekommt keinen Wert */
  generator: string
  comment: string
  /** Gültiger/bevorzugter Wert des Felds (genau einer je Feld) */
  preferred?: boolean
  errorCode?: string
  errorMessage?: string
}

interface FieldDef {
  name: string
  eqClasses: EqClass[]
}

interface SectionDef {
  name: string
  fields: FieldDef[]
}

interface TestcaseDef {
  name: string
  /** error: nachfolgende Felder werden geöffnet (a/e); valid: alles andere bleibt auf x */
  kind: 'error' | 'valid'
  /** Ziel: Feld und Klasse, nach NAMEN (nie nach Index). Fehlt beim Happy Path */
  target?: { field: string; eqClass: string }
}

interface TableDef {
  sheetName: string
  execute: 'T' | 'F'
  sections: SectionDef[]
  testcases: TestcaseDef[]
}

// ---------------------------------------------------------------------------
// Tabelle User — Datentabelle (Execute = F)
// ---------------------------------------------------------------------------

const userTable: TableDef = {
  sheetName: 'User',
  execute: 'F',
  sections: [
    {
      name: 'Zugangsdaten',
      fields: [
        {
          name: 'email',
          eqClasses: [
            { name: 'valid', generator: 'gen:1:faker:internet.email', comment: 'Gültige E-Mail-Adresse', preferred: true },
            { name: 'empty', generator: 'gen::text:empty', comment: 'Pflichtfeld leer', errorCode: 'EMAIL_EMPTY', errorMessage: 'E-Mail ist ein Pflichtfeld' },
            { name: 'invalidFormat', generator: 'not-an-email', comment: 'Kein @, keine Domain', errorCode: 'EMAIL_FORMAT', errorMessage: 'E-Mail hat ein ungültiges Format' },
            { name: 'tooLong', generator: 'gen::text:email:243', comment: '255 Zeichen, max. 254 (RFC 5321)', errorCode: 'EMAIL_TOO_LONG', errorMessage: 'E-Mail ist länger als 254 Zeichen' }
          ]
        },
        {
          name: 'password',
          eqClasses: [
            { name: 'valid', generator: 'gen:1:faker:internet.password', comment: 'Gültiges Passwort', preferred: true },
            { name: 'empty', generator: 'gen::text:empty', comment: 'Pflichtfeld leer', errorCode: 'PASSWORD_EMPTY', errorMessage: 'Passwort ist ein Pflichtfeld' },
            { name: 'tooLong', generator: 'gen::text:alpha:129', comment: '129 Zeichen, max. 128', errorCode: 'PASSWORD_TOO_LONG', errorMessage: 'Passwort ist länger als 128 Zeichen' }
          ]
        }
      ]
    }
  ],
  // Sequentielle Namen: Login referenziert per Bereich [invalid_1-5]
  testcases: [
    { name: 'invalid_1', kind: 'error', target: { field: 'email', eqClass: 'empty' } },
    { name: 'invalid_2', kind: 'error', target: { field: 'email', eqClass: 'invalidFormat' } },
    { name: 'invalid_3', kind: 'error', target: { field: 'email', eqClass: 'tooLong' } },
    { name: 'invalid_4', kind: 'error', target: { field: 'password', eqClass: 'empty' } },
    { name: 'invalid_5', kind: 'error', target: { field: 'password', eqClass: 'tooLong' } },
    { name: 'valid_1', kind: 'valid' }
  ]
}

// ---------------------------------------------------------------------------
// Tabelle Login — Testfall-Tabelle (Execute = T)
// ---------------------------------------------------------------------------

const loginTable: TableDef = {
  sheetName: 'Login',
  execute: 'T',
  sections: [
    {
      name: 'Sekundärdaten',
      fields: [
        {
          name: 'sitzung',
          eqClasses: [
            { name: 'abgemeldet', generator: '', comment: 'Basiszustand: niemand angemeldet', preferred: true }
          ]
        },
        {
          name: 'registrierterUser',
          eqClasses: [
            { name: 'ja', generator: 'ref:1:User::valid_1', comment: 'Benutzer vorab per API anlegen (Instanz 1)', preferred: true },
            { name: 'nein', generator: '', comment: 'Kein Benutzer angelegt', errorCode: 'INVALID_CREDENTIALS', errorMessage: 'E-Mail oder Passwort ist falsch' }
          ]
        }
      ]
    },
    {
      name: 'Primärdaten',
      fields: [
        {
          name: 'eingabe',
          eqClasses: [
            { name: 'gueltig', generator: 'ref:1:User::valid_1', comment: 'Zugangsdaten des registrierten Benutzers (Instanz 1)', preferred: true },
            { name: 'ungueltig', generator: 'ref::User::[invalid_1-5]', comment: 'Alle Formularfehler aus User', errorCode: 'FORM_INVALID', errorMessage: 'Formularvalidierung schlägt fehl (Detail-Code siehe User)' }
          ]
        },
        {
          name: 'abweichendesPasswort',
          eqClasses: [
            { name: 'nein', generator: '', comment: 'Passwort aus eingabe wird getippt', preferred: true },
            { name: 'ja', generator: 'ref:2:User:password:valid_1', comment: 'Passwort eines anderen Benutzers (Instanz 2) statt des registrierten', errorCode: 'INVALID_CREDENTIALS', errorMessage: 'E-Mail oder Passwort ist falsch' }
          ]
        },
        {
          name: 'angemeldetBleiben',
          eqClasses: [
            { name: 'false', generator: 'false', comment: 'Checkbox nicht gesetzt', preferred: true },
            { name: 'true', generator: 'true', comment: 'Checkbox gesetzt: Sitzung bleibt bestehen' }
          ]
        }
      ]
    }
  ],
  testcases: [
    { name: 'unbekannterUser', kind: 'error', target: { field: 'registrierterUser', eqClass: 'nein' } },
    { name: 'ungueltigeEingabe', kind: 'error', target: { field: 'eingabe', eqClass: 'ungueltig' } },
    { name: 'falschesPasswort', kind: 'error', target: { field: 'abweichendesPasswort', eqClass: 'ja' } },
    { name: 'anmeldenMitMerken', kind: 'valid', target: { field: 'angemeldetBleiben', eqClass: 'true' } },
    { name: 'anmeldenErfolgreich', kind: 'valid' }
  ]
}

// ---------------------------------------------------------------------------
// Marker-Logik (CASCADE)
// ---------------------------------------------------------------------------

function allFields(table: TableDef): FieldDef[] {
  return table.sections.flatMap((s) => s.fields)
}

function findField(table: TableDef, name: string): FieldDef {
  const field = allFields(table).find((f) => f.name === name)
  if (field === undefined) throw new Error(`${table.sheetName}: Feld '${name}' gibt es nicht`)
  return field
}

function findClass(field: FieldDef, name: string): EqClass {
  const eqClass = field.eqClasses.find((k) => k.name === name)
  if (eqClass === undefined) throw new Error(`Feld '${field.name}': Klasse '${name}' gibt es nicht`)
  return eqClass
}

function preferredOf(field: FieldDef): EqClass {
  const preferred = field.eqClasses.filter((k) => k.preferred === true)
  if (preferred.length !== 1) throw new Error(`Feld '${field.name}': genau eine bevorzugte Klasse nötig`)
  return preferred[0]
}

/** Marker je Feld → Klasse für einen Testfall */
function markersFor(table: TableDef, tc: TestcaseDef): Map<EqClass, string> {
  const markers = new Map<EqClass, string>()
  const fields = allFields(table)
  const targetIndex = tc.target === undefined ? -1 : fields.indexOf(findField(table, tc.target.field))

  fields.forEach((field, i) => {
    if (i === targetIndex && tc.target !== undefined) {
      markers.set(findClass(field, tc.target.eqClass), 'x')
    } else if (tc.kind === 'error' && i > targetIndex && field.eqClasses.length > 1) {
      // Nachfolger einer Fehlerspalte: a auf gültig, e auf den Rest
      for (const k of field.eqClasses) markers.set(k, k.preferred === true ? 'a' : 'e')
    } else {
      markers.set(preferredOf(field), 'x')
    }
  })
  return markers
}

/** Erwartetes Ergebnis eines Testfalls: errorCode, 'valid_variant' oder 'valid' */
function expectedOf(table: TableDef, tc: TestcaseDef): string {
  if (tc.target === undefined) return 'valid'
  const target = findClass(findField(table, tc.target.field), tc.target.eqClass)
  return target.errorCode ?? 'valid_variant'
}

// ---------------------------------------------------------------------------
// Excel schreiben
// ---------------------------------------------------------------------------

const BLUE_DARK = 'FF0070C0'
const BLUE = 'FF4472C4'
const GREEN = 'FF00B050'
const WHITE = 'FFFFFFFF'
const FONT_BLUE = 'FF0070C0'
const FIRST_TC_COL = 6

function colLetter(col: number): string {
  let s = ''
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  return s
}

function styleRow(row: ExcelJS.Row, lastCol: number, fill: string, font: Partial<ExcelJS.Font>): void {
  for (let c = 1; c <= lastCol; c++) {
    const cell = row.getCell(c)
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } }
    cell.font = font
  }
}

function writeTable(wb: ExcelJS.Workbook, table: TableDef): void {
  const ws = wb.addWorksheet(table.sheetName)
  const tcs = table.testcases
  const lastCol = FIRST_TC_COL + tcs.length - 1
  const tcCol = (i: number): number => FIRST_TC_COL + i
  const markers = tcs.map((tc) => markersFor(table, tc))
  const styles: { row: number; fill?: string; font?: Partial<ExcelJS.Font> }[] = []
  let r = 1

  // Kopf
  // null statt '': leere Strings zählen in Excel bei COUNTA mit
  ws.getRow(r).values = ['<DECISION_TABLE>', null, null, null, null, ...tcs.map((tc) => tc.name)]
  styles.push({ row: r++, fill: BLUE_DARK, font: { color: { argb: WHITE }, bold: true } })

  ws.getRow(r).values = ['Execute', 'ExecuteSection', null, null, null, ...tcs.map(() => table.execute)]
  styles.push({ row: r++, fill: BLUE, font: { color: { argb: WHITE } } })

  ws.getRow(r).values = ['Multiply', 'MultiplicitySection', null, null, null, ...tcs.map(() => 1)]
  styles.push({ row: r++, fill: BLUE, font: { color: { argb: WHITE } } })

  // Felder
  const fssRows: number[] = []
  for (const section of table.sections) {
    ws.getRow(r).values = [section.name, 'FieldSection']
    styles.push({ row: r++, fill: BLUE, font: { color: { argb: WHITE } } })

    for (const field of section.fields) {
      const headerRow = r++
      const first = r
      const last = r + field.eqClasses.length - 1
      fssRows.push(headerRow)

      const header = ws.getRow(headerRow)
      header.getCell(1).value = field.name
      header.getCell(2).value = 'FieldSubSection'
      header.getCell(3).value = { formula: `COUNTA(C${first}:C${last})` }
      tcs.forEach((_, i) => {
        const L = colLetter(tcCol(i))
        header.getCell(tcCol(i)).value = { formula: `COUNTA(${L}${first}:${L}${last})` }
      })
      styles.push({ row: headerRow, fill: BLUE, font: { color: { argb: WHITE } } })

      for (const k of field.eqClasses) {
        const row = ws.getRow(r++)
        row.getCell(3).value = k.name
        if (k.generator !== '') row.getCell(4).value = k.generator
        row.getCell(5).value = k.comment
        tcs.forEach((_, i) => {
          const m = markers[i].get(k)
          if (m !== undefined) row.getCell(tcCol(i)).value = m
        })
      }
    }
  }

  // Summary
  const summaryRow = r++
  const sRow = ws.getRow(summaryRow)
  sRow.getCell(1).value = 'Summary'
  sRow.getCell(2).value = 'SummarySection'
  sRow.getCell(3).value = { formula: fssRows.map((fr) => `C${fr}`).join('*') }
  tcs.forEach((_, i) => {
    const L = colLetter(tcCol(i))
    sRow.getCell(tcCol(i)).value = { formula: fssRows.map((fr) => `${L}${fr}`).join('*') }
  })
  sRow.getCell(5).value = { formula: `SUM(${colLetter(FIRST_TC_COL)}${summaryRow}:${colLetter(lastCol)}${summaryRow})` }
  sRow.getCell(4).value = { formula: `E${summaryRow}/C${summaryRow}` }
  sRow.getCell(4).numFmt = '0.00%'
  styles.push({ row: summaryRow, fill: GREEN, font: { color: { argb: WHITE }, bold: true } })

  // Expected Result: eine Zeile je Error-Code
  const expected = tcs.map((tc) => expectedOf(table, tc))
  const codes = new Map<string, string>([['valid', 'Daten sind gültig, kein Fehler']])
  for (const field of allFields(table)) {
    for (const k of field.eqClasses) {
      if (k.errorCode !== undefined) codes.set(k.errorCode, k.errorMessage ?? '')
    }
  }
  if (expected.includes('valid_variant')) codes.set('valid_variant', 'Gültige Variante, kein Fehler')

  ws.getRow(r).values = ['Expected Result', 'MultiRowSection']
  styles.push({ row: r++, fill: GREEN, font: { color: { argb: FONT_BLUE } } })
  for (const [code, message] of codes) {
    ws.getRow(r++).values = [null, null, code, message, null, ...expected.map((e) => (e === code ? 'x' : null))]
  }

  // Category
  const isValid = expected.map((e) => e === 'valid' || e === 'valid_variant')
  ws.getRow(r).values = ['Category', 'TagSection']
  styles.push({ row: r++, fill: BLUE, font: { color: { argb: WHITE } } })
  ws.getRow(r++).values = [null, null, 'negative', null, null, ...isValid.map((v) => (v ? null : 'x'))]
  ws.getRow(r++).values = [null, null, 'valid', null, null, ...isValid.map((v) => (v ? 'x' : null))]

  ws.getRow(r).values = ['<END>']
  styles.push({ row: r, fill: BLUE, font: { color: { argb: WHITE } } })

  // Styling erst nach dem Schreiben der Daten
  for (let i = 1; i <= r; i++) ws.getRow(i).commit()
  for (const s of styles) {
    if (s.fill !== undefined && s.font !== undefined) styleRow(ws.getRow(s.row), lastCol, s.fill, s.font)
  }
  for (let i = 1; i <= r; i++) {
    for (let c = FIRST_TC_COL; c <= lastCol; c++) {
      ws.getRow(i).getCell(c).alignment = { horizontal: 'center', vertical: 'middle' }
    }
  }

  ws.getColumn(1).width = 25
  ws.getColumn(2).width = 20
  ws.getColumn(3).width = 30
  ws.getColumn(4).width = 35
  ws.getColumn(5).width = 30
  for (let c = FIRST_TC_COL; c <= lastCol; c++) ws.getColumn(c).width = 5
}

const wb = new ExcelJS.Workbook()
// Beide Tabellen in EINER Mappe: Referenzen lösen sich nicht über Dateigrenzen auf
writeTable(wb, userTable)
writeTable(wb, loginTable)

await fs.mkdir('resources', { recursive: true })
await wb.xlsx.writeFile('resources/login-tests.xlsx')
console.log('resources/login-tests.xlsx geschrieben')
