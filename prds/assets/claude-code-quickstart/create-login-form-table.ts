/**
 * Erzeugt die Nanook Decision Tables für das Login-Formular als formatierte Excel-Datei.
 *
 * Ergebnis: resources/login-form-tests.xlsx mit zwei Blättern
 *
 *   User   Execute = F   Datentabelle: die Felder des Login-Formulars (email, password) mit ihren
 *                        Äquivalenzklassen. Erzeugt von sich aus nichts, wird nur referenziert.
 *                        Dieselbe Tabelle kann später Registrierung und Kundenanlage bedienen.
 *   Login  Execute = T   Testfall-Tabelle: Basiszustand (Sekundärdaten) und Eingabe (Primärdaten).
 *                        Definiert keine Feldklassen selbst, sondern holt sie per Referenz aus 'User'.
 *
 * Deckung: CASCADE-Muster, Fehlerspalten zuerst, je nicht-bevorzugter Klasse genau eine eigene Spalte.
 * Das Feld mit gültiger Alternative (rememberMe) steht zuletzt, damit die Summe exakt 100 % trifft.
 * Das Script rechnet die Deckung vorab und bricht ab, wenn sie nicht 100 % ergibt oder eine Klasse
 * kein eigenes 'x' hat. Alle Klassen werden nach NAMEN gesucht, nie nach Index.
 *
 * Referenzsyntax laut Code (TestcaseDefinitionDecision.createReferenceDirective):
 *   ref:<instanceId>:<Tabelle>:<Feld>:<Testfall>      Feld VOR Testfall!
 *
 * Ausführen:   node scripts/create-login-form-table.ts       (Node >= 22.18 führt .ts direkt aus)
 * Prüfen:      node scripts/check-login-form-table.ts
 * Generieren:  node scripts/generate-login-form-fixtures.ts
 */
import path from 'node:path'
import fs from 'node:fs/promises'
import ExcelJS from 'exceljs'

// ------------------------------------------------------------------
// Modell
// ------------------------------------------------------------------

interface EqClass {
  name: string
  /** Statischer Wert, gen:... oder ref:... — leer = kein Wert */
  generator: string
  comment: string
  /** Die gültige/bevorzugte Klasse des Feldes (genau eine pro Feld) */
  preferred?: boolean
  /** Fehlerklasse: erwarteter Fehlercode und Beschreibung */
  errorCode?: string
  errorMessage?: string
  /** Gültige Variante (kein Fehler, aber nicht bevorzugt): eigene Ergebniszeile */
  resultCode?: string
  resultMessage?: string
}

interface FieldDef {
  name: string
  eqClasses: EqClass[]
}

interface SectionDef {
  name: string
  fields: FieldDef[]
}

interface Cell {
  field: string
  eqClass: string
}

interface TestcaseDef {
  name: string
  /** Zielfeld und Zielklasse. Fehlt es, ist das der Happy Path */
  target?: Cell
  /** Kombinationen, die in dieser Spalte logisch unmöglich sind → Marker 'i' */
  impossible?: Cell[]
}

interface TableDef {
  name: string
  execute: boolean
  sections: SectionDef[]
  testcases: TestcaseDef[]
  /** Beschreibung der Zeile 'valid' im Expected Result */
  validMessage: string
}

type Marker = 'x' | 'a' | 'e' | 'i' | ''

// ------------------------------------------------------------------
// Hilfen: Klassen nach Namen suchen
// ------------------------------------------------------------------

function allFields(table: TableDef): FieldDef[] {
  return table.sections.flatMap((s) => s.fields)
}

function findField(table: TableDef, name: string): FieldDef {
  const field = allFields(table).find((f) => f.name === name)
  if (field === undefined) {
    throw new Error(`Tabelle '${table.name}': Feld '${name}' gibt es nicht`)
  }
  return field
}

function findClass(table: TableDef, cell: Cell): EqClass {
  const field = findField(table, cell.field)
  const eq = field.eqClasses.find((c) => c.name === cell.eqClass)
  if (eq === undefined) {
    throw new Error(
      `Tabelle '${table.name}': Feld '${cell.field}' hat keine Klasse '${cell.eqClass}'`
    )
  }
  return eq
}

function preferredOf(table: TableDef, field: FieldDef): EqClass {
  const list = field.eqClasses.filter((c) => c.preferred)
  if (list.length !== 1) {
    throw new Error(
      `Tabelle '${table.name}': Feld '${field.name}' braucht genau eine bevorzugte Klasse, hat ${list.length}`
    )
  }
  return list[0]
}

function errorClasses(field: FieldDef): EqClass[] {
  return field.eqClasses.filter((c) => !c.preferred)
}

/**
 * Sequentielle Fehler-Testfälle einer Datentabelle: <feld>_invalid_1 … _N, danach valid_1.
 * Damit sind Bereichsreferenzen je Feld möglich: [email_invalid_1-4]
 */
function dataTableTestcases(table: TableDef): TestcaseDef[] {
  const tcs: TestcaseDef[] = []
  for (const field of allFields(table)) {
    errorClasses(field).forEach((eq, i) => {
      tcs.push({
        name: `${field.name}_invalid_${i + 1}`,
        target: { field: field.name, eqClass: eq.name }
      })
    })
  }
  tcs.push({ name: 'valid_1' })
  return tcs
}

/** Bereichsreferenz auf alle Fehlerfälle eines Feldes der Datentabelle, z.B. ref::User:email:[email_invalid_1-4] */
function rangeRef(table: TableDef, fieldName: string, refField: string): string {
  const n = errorClasses(findField(table, fieldName)).length
  if (n === 0) {
    throw new Error(`Tabelle '${table.name}': Feld '${fieldName}' hat keine Fehlerklassen`)
  }
  return `ref::${table.name}:${refField}:[${fieldName}_invalid_1-${n}]`
}

// ------------------------------------------------------------------
// Testobjekt: Login-Formular
// ------------------------------------------------------------------

const USER: TableDef = {
  name: 'User',
  execute: false,
  validMessage: 'Zugangsdaten gültig, kein Feldfehler',
  sections: [
    {
      name: 'Zugangsdaten',
      fields: [
        {
          name: 'email',
          eqClasses: [
            {
              name: 'valid',
              generator: 'gen:1:faker:internet.email',
              comment: 'Gültige E-Mail-Adresse',
              preferred: true
            },
            {
              name: 'empty',
              generator: 'gen::text:empty',
              comment: 'Pflichtfeld leer (Leerstring, damit Feldreferenzen auflösbar bleiben)',
              errorCode: 'EMAIL_EMPTY',
              errorMessage: 'E-Mail ist Pflichtfeld'
            },
            {
              name: 'whitespace',
              generator: 'gen::text:spaces:3',
              comment: 'Nur Leerzeichen (Importer trimmt Zellen, daher per Generator)',
              errorCode: 'EMAIL_WHITESPACE',
              errorMessage: 'E-Mail darf nicht nur aus Leerzeichen bestehen'
            },
            {
              name: 'invalidFormat',
              generator: 'not-an-email',
              comment: 'Kein @, kein gültiges Format',
              errorCode: 'EMAIL_FORMAT',
              errorMessage: 'E-Mail hat ein ungültiges Format'
            },
            {
              name: 'tooLong',
              generator: 'gen::text:email:250',
              comment: '262 Zeichen; Annahme: max. 254 (RFC 5321)',
              errorCode: 'EMAIL_TOO_LONG',
              errorMessage: 'E-Mail überschreitet die maximale Länge'
            }
          ]
        },
        {
          name: 'password',
          eqClasses: [
            {
              name: 'valid',
              generator: 'gen:1:faker:internet.password',
              comment: 'Gültiges Passwort (Faker, 15 Zeichen)',
              preferred: true
            },
            {
              name: 'empty',
              generator: 'gen::text:empty',
              comment: 'Pflichtfeld leer (Leerstring)',
              errorCode: 'PASSWORD_EMPTY',
              errorMessage: 'Passwort ist Pflichtfeld'
            },
            {
              name: 'tooLong',
              generator: 'gen::text:alpha:200',
              comment: '200 Zeichen; Annahme: max. 128',
              errorCode: 'PASSWORD_TOO_LONG',
              errorMessage: 'Passwort überschreitet die maximale Länge'
            }
          ]
        }
      ]
    }
  ],
  testcases: [] // wird unten sequentiell erzeugt
}
USER.testcases = dataTableTestcases(USER)

const INVALID_CREDENTIALS =
  'Anmeldung abgelehnt: E-Mail oder Passwort falsch (keine Unterscheidung nach außen)'

const LOGIN: TableDef = {
  name: 'Login',
  execute: true,
  validMessage: 'Anmeldung erfolgreich: Weiterleitung, Session-Cookie gesetzt',
  sections: [
    {
      name: 'Sekundärdaten (Basiszustand)',
      fields: [
        {
          name: 'session',
          eqClasses: [
            {
              name: 'loggedOut',
              generator: 'loggedOut',
              comment: 'Niemand angemeldet, Login-Seite erreichbar',
              preferred: true
            }
          ]
        },
        {
          name: 'existingUser',
          eqClasses: [
            {
              name: 'registered',
              generator: 'ref:1:User:email:valid_1',
              comment:
                'User-Instanz 1 wird vor dem Test per API angelegt (Wert = dessen E-Mail, Daten unter data.User)',
              preferred: true
            },
            {
              name: 'none',
              generator: 'none',
              comment: 'Kein Benutzer angelegt → die eingegebene E-Mail ist unbekannt',
              errorCode: 'INVALID_CREDENTIALS',
              errorMessage: INVALID_CREDENTIALS
            }
          ]
        },
        {
          name: 'emailVerified',
          eqClasses: [
            {
              name: 'yes',
              generator: 'yes',
              comment: 'Bestätigungslink des angelegten Users wurde aufgerufen',
              preferred: true
            },
            {
              name: 'no',
              generator: 'no',
              comment: 'Bestätigungslink nicht aufgerufen',
              errorCode: 'EMAIL_NOT_VERIFIED',
              errorMessage: 'Anmeldung abgelehnt: E-Mail-Adresse nicht bestätigt (403)'
            }
          ]
        }
      ]
    },
    {
      name: 'Primärdaten (Eingabe)',
      fields: [
        {
          name: 'email',
          eqClasses: [
            {
              name: 'ofUser1',
              generator: 'ref:1:User:email:valid_1',
              comment: 'E-Mail der User-Instanz 1',
              preferred: true
            },
            {
              name: 'invalid',
              generator: rangeRef(USER, 'email', 'email'),
              comment: 'Formularfehler E-Mail: je ein Fixture pro User-Klasse',
              errorCode: 'FORM_ERROR_EMAIL',
              errorMessage:
                'Feldfehler am Feld E-Mail; konkreter Code im Expected Result der User-Instanz'
            }
          ]
        },
        {
          name: 'password',
          eqClasses: [
            {
              name: 'ofUser1',
              generator: 'ref:1:User:password:valid_1',
              comment: 'Passwort der User-Instanz 1 (passt zur E-Mail)',
              preferred: true
            },
            {
              name: 'ofUser2',
              generator: 'ref:2:User:password:valid_1',
              comment: 'Gültiges Passwort einer anderen User-Instanz → passt nicht',
              errorCode: 'INVALID_CREDENTIALS',
              errorMessage: INVALID_CREDENTIALS
            },
            {
              name: 'invalid',
              generator: rangeRef(USER, 'password', 'password'),
              comment: 'Formularfehler Passwort: je ein Fixture pro User-Klasse',
              errorCode: 'FORM_ERROR_PASSWORD',
              errorMessage:
                'Feldfehler am Feld Passwort; konkreter Code im Expected Result der User-Instanz'
            }
          ]
        },
        {
          name: 'rememberMe',
          eqClasses: [
            {
              name: 'false',
              generator: 'false',
              comment: 'Checkbox nicht gesetzt',
              preferred: true
            },
            {
              name: 'true',
              generator: 'true',
              comment: 'Checkbox gesetzt; gültige Alternative, steht deshalb als letztes Feld',
              resultCode: 'SESSION_PERSISTENT',
              resultMessage: 'Anmeldung erfolgreich; Session bleibt nach Browser-Neustart erhalten'
            }
          ]
        }
      ]
    }
  ],
  testcases: [
    {
      name: 'user_unknown',
      target: { field: 'existingUser', eqClass: 'none' },
      impossible: [{ field: 'emailVerified', eqClass: 'no' }]
    },
    { name: 'user_notVerified', target: { field: 'emailVerified', eqClass: 'no' } },
    { name: 'email_invalid', target: { field: 'email', eqClass: 'invalid' } },
    { name: 'password_wrong', target: { field: 'password', eqClass: 'ofUser2' } },
    { name: 'password_invalid', target: { field: 'password', eqClass: 'invalid' } },
    { name: 'valid_rememberMe', target: { field: 'rememberMe', eqClass: 'true' } },
    { name: 'valid_1' }
  ]
}

// ------------------------------------------------------------------
// Marker-Logik (CASCADE)
// ------------------------------------------------------------------

/**
 * Marker je Feld und Klasse für eine Spalte:
 *  - Happy Path: überall 'x' auf der bevorzugten Klasse
 *  - Fehlerspalte: davor 'x' bevorzugt, Ziel 'x', danach 'a' bevorzugt + 'e' Rest ('i' bei unmöglich)
 *  - Gutfall-Variante: danach nur 'x' bevorzugt (eine Gutfall-Spalte öffnet keine Fehlerklassen)
 */
function markersFor(table: TableDef, tc: TestcaseDef): Map<string, Map<string, Marker>> {
  const fields = allFields(table)
  const result = new Map<string, Map<string, Marker>>()

  const targetIdx = tc.target ? fields.indexOf(findField(table, tc.target.field)) : -1
  const targetClass = tc.target ? findClass(table, tc.target) : undefined
  const isErrorColumn = targetClass?.errorCode !== undefined

  for (const cell of tc.impossible ?? []) {
    const idx = fields.indexOf(findField(table, cell.field))
    if (idx <= targetIdx) {
      throw new Error(
        `Spalte '${tc.name}': 'impossible' nur für Felder NACH dem Zielfeld sinnvoll (${cell.field})`
      )
    }
    if (findClass(table, cell).preferred) {
      throw new Error(`Spalte '${tc.name}': die bevorzugte Klasse kann nicht unmöglich sein`)
    }
  }

  fields.forEach((field, idx) => {
    const preferred = preferredOf(table, field)
    const row = new Map<string, Marker>()
    field.eqClasses.forEach((eq) => row.set(eq.name, ''))

    if (idx < targetIdx || targetIdx === -1 || (idx > targetIdx && !isErrorColumn)) {
      row.set(preferred.name, 'x')
    } else if (idx === targetIdx && targetClass) {
      row.set(targetClass.name, 'x')
    } else {
      const impossible = new Set(
        (tc.impossible ?? []).filter((c) => c.field === field.name).map((c) => c.eqClass)
      )
      let opened = 0
      for (const eq of field.eqClasses) {
        if (eq.preferred) continue
        if (impossible.has(eq.name)) {
          row.set(eq.name, 'i')
        } else {
          row.set(eq.name, 'e')
          opened++
        }
      }
      row.set(preferred.name, opened > 0 ? 'a' : 'x')
    }
    result.set(field.name, row)
  })
  return result
}

interface TableModel {
  markers: Map<string, Map<string, Map<string, Marker>>> // tc → field → class → marker
  total: number
  products: Map<string, number>
  sum: number
}

function buildModel(table: TableDef): TableModel {
  const fields = allFields(table)
  const names = new Set<string>()
  for (const tc of table.testcases) {
    if (names.has(tc.name)) throw new Error(`Tabelle '${table.name}': Spalte '${tc.name}' doppelt`)
    names.add(tc.name)
  }

  const markers = new Map<string, Map<string, Map<string, Marker>>>()
  const products = new Map<string, number>()
  for (const tc of table.testcases) {
    const m = markersFor(table, tc)
    markers.set(tc.name, m)
    let product = 1
    for (const field of fields) {
      const row = m.get(field.name)!
      product *= [...row.values()].filter((v) => v !== '').length
    }
    products.set(tc.name, product)
  }

  const total = fields.reduce((acc, f) => acc * f.eqClasses.length, 1)
  const sum = [...products.values()].reduce((a, b) => a + b, 0)

  // Hat jede Klasse einen eigenen Testfall? (nur 'x' zählt, a/e sind eine Auswahl)
  const missing: string[] = []
  for (const field of fields) {
    for (const eq of field.eqClasses) {
      const hasX = table.testcases.some((tc) => markers.get(tc.name)!.get(field.name)!.get(eq.name) === 'x')
      if (!hasX) missing.push(`${field.name}.${eq.name}`)
    }
  }
  if (missing.length > 0) {
    throw new Error(`Tabelle '${table.name}': Klassen ohne eigenes 'x': ${missing.join(', ')}`)
  }
  if (sum !== total) {
    throw new Error(
      `Tabelle '${table.name}': Deckung ${sum}/${total} = ${((100 * sum) / total).toFixed(2)} %, erwartet 100 %`
    )
  }
  return { markers, total, products, sum }
}

// ------------------------------------------------------------------
// Expected Result / Category
// ------------------------------------------------------------------

interface ResultRow {
  key: string
  message: string
  negative: boolean
}

function resultRows(table: TableDef): ResultRow[] {
  const rows: ResultRow[] = [{ key: 'valid', message: table.validMessage, negative: false }]
  const add = (row: ResultRow) => {
    if (!rows.some((r) => r.key === row.key)) rows.push(row)
  }
  for (const field of allFields(table)) {
    for (const eq of field.eqClasses) {
      if (eq.errorCode) {
        add({ key: eq.errorCode, message: eq.errorMessage ?? '', negative: true })
      } else if (eq.resultCode) {
        add({ key: eq.resultCode, message: eq.resultMessage ?? '', negative: false })
      } else if (!eq.preferred) {
        add({ key: 'valid_variant', message: 'Gültige Variante, kein Fehler', negative: false })
      }
    }
  }
  return rows
}

function resultKeyOf(table: TableDef, tc: TestcaseDef): string {
  if (!tc.target) return 'valid'
  const eq = findClass(table, tc.target)
  return eq.errorCode ?? eq.resultCode ?? 'valid_variant'
}

// ------------------------------------------------------------------
// Excel
// ------------------------------------------------------------------

const FIRST_TC_COL = 6 // Spalte F
const COLOR_HEADER = 'FF0070C0'
const COLOR_SECTION = 'FF4472C4'
const COLOR_SUMMARY = 'FF00B050'
const FONT_WHITE: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' } }
const FONT_WHITE_BOLD: Partial<ExcelJS.Font> = { color: { argb: 'FFFFFFFF' }, bold: true }
const FONT_BLUE: Partial<ExcelJS.Font> = { color: { argb: 'FF0070C0' }, bold: true }

function solid(argb: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

function styleRow(ws: ExcelJS.Worksheet, row: number, lastCol: number, argb: string, font: Partial<ExcelJS.Font>) {
  for (let c = 1; c <= lastCol; c++) {
    const cell = ws.getCell(row, c)
    cell.fill = solid(argb)
    cell.font = font
  }
}

function centerTcCells(ws: ExcelJS.Worksheet, row: number, tcCount: number) {
  for (let i = 0; i < tcCount; i++) {
    ws.getCell(row, FIRST_TC_COL + i).alignment = { horizontal: 'center', vertical: 'middle' }
  }
}

function writeTable(ws: ExcelJS.Worksheet, table: TableDef, model: TableModel) {
  const tcs = table.testcases
  const fields = allFields(table)
  const lastCol = FIRST_TC_COL + tcs.length - 1
  const colLetter = (c: number) => ws.getColumn(c).letter

  ws.getColumn(1).width = 25
  ws.getColumn(2).width = 20
  ws.getColumn(3).width = 30
  ws.getColumn(4).width = 35
  ws.getColumn(5).width = 45
  for (let i = 0; i < tcs.length; i++) ws.getColumn(FIRST_TC_COL + i).width = 5
  ws.views = [{ state: 'frozen', xSplit: 5, ySplit: 1 }]

  let r = 1

  // Kopfzeile: Tabellen-Kennung, Spaltenbeschriftung, Testfallnamen (Spalten B-E liest der Parser nicht)
  ws.getCell(r, 1).value = '<DECISION_TABLE>'
  ws.getCell(r, 2).value = 'Section'
  ws.getCell(r, 3).value = 'Equivalence class'
  ws.getCell(r, 4).value = 'Generator'
  ws.getCell(r, 5).value = 'Comment'
  tcs.forEach((tc, i) => {
    const cell = ws.getCell(r, FIRST_TC_COL + i)
    cell.value = tc.name
    cell.alignment = { textRotation: 90, horizontal: 'center', vertical: 'bottom' }
  })
  ws.getRow(r).height = 110
  styleRow(ws, r, lastCol, COLOR_HEADER, FONT_WHITE_BOLD)
  r++

  // Execute
  ws.getCell(r, 1).value = 'Execute'
  ws.getCell(r, 2).value = 'ExecuteSection'
  tcs.forEach((_, i) => (ws.getCell(r, FIRST_TC_COL + i).value = table.execute ? 'T' : 'F'))
  styleRow(ws, r, lastCol, COLOR_SECTION, FONT_WHITE)
  centerTcCells(ws, r, tcs.length)
  r++

  // Multiply
  ws.getCell(r, 1).value = 'Multiply'
  ws.getCell(r, 2).value = 'MultiplicitySection'
  tcs.forEach((_, i) => (ws.getCell(r, FIRST_TC_COL + i).value = 1))
  styleRow(ws, r, lastCol, COLOR_SECTION, FONT_WHITE)
  centerTcCells(ws, r, tcs.length)
  r++

  // Felder
  const fssRows: number[] = []
  for (const section of table.sections) {
    ws.getCell(r, 1).value = section.name
    ws.getCell(r, 2).value = 'FieldSection'
    styleRow(ws, r, lastCol, COLOR_SECTION, FONT_WHITE)
    r++

    for (const field of section.fields) {
      const headerRow = r
      fssRows.push(headerRow)
      ws.getCell(r, 1).value = field.name
      ws.getCell(r, 2).value = 'FieldSubSection'
      r++

      const first = r
      for (const eq of field.eqClasses) {
        ws.getCell(r, 3).value = eq.name
        if (eq.generator !== '') ws.getCell(r, 4).value = eq.generator
        ws.getCell(r, 5).value = eq.comment
        tcs.forEach((tc, i) => {
          const marker = model.markers.get(tc.name)!.get(field.name)!.get(eq.name)!
          if (marker !== '') ws.getCell(r, FIRST_TC_COL + i).value = marker
        })
        centerTcCells(ws, r, tcs.length)
        r++
      }
      const last = r - 1

      ws.getCell(headerRow, 3).value = {
        formula: `COUNTA(C${first}:C${last})`,
        result: field.eqClasses.length
      }
      tcs.forEach((tc, i) => {
        const col = colLetter(FIRST_TC_COL + i)
        const row = model.markers.get(tc.name)!.get(field.name)!
        ws.getCell(headerRow, FIRST_TC_COL + i).value = {
          formula: `COUNTA(${col}${first}:${col}${last})`,
          result: [...row.values()].filter((v) => v !== '').length
        }
      })
      styleRow(ws, headerRow, lastCol, COLOR_SECTION, FONT_WHITE)
      centerTcCells(ws, headerRow, tcs.length)
    }
  }

  // Summary
  const sumRow = r
  ws.getCell(r, 1).value = 'Summary'
  ws.getCell(r, 2).value = 'SummarySection'
  ws.getCell(r, 3).value = { formula: fssRows.map((rr) => `C${rr}`).join('*'), result: model.total }
  ws.getCell(r, 5).value = {
    formula: `SUM(${colLetter(FIRST_TC_COL)}${sumRow}:${colLetter(lastCol)}${sumRow})`,
    result: model.sum
  }
  ws.getCell(r, 4).value = { formula: `E${sumRow}/C${sumRow}`, result: model.sum / model.total }
  ws.getCell(r, 4).numFmt = '0.00%'
  tcs.forEach((tc, i) => {
    const col = colLetter(FIRST_TC_COL + i)
    ws.getCell(r, FIRST_TC_COL + i).value = {
      formula: fssRows.map((rr) => `${col}${rr}`).join('*'),
      result: model.products.get(tc.name)!
    }
  })
  styleRow(ws, r, lastCol, COLOR_SUMMARY, FONT_WHITE_BOLD)
  centerTcCells(ws, r, tcs.length)
  r++

  // Expected Result: eine Zeile je Ergebnis-Code, C = Code, D = Beschreibung
  ws.getCell(r, 1).value = 'Expected Result'
  ws.getCell(r, 2).value = 'MultiRowSection'
  styleRow(ws, r, lastCol, COLOR_SUMMARY, FONT_BLUE)
  r++
  const rows = resultRows(table)
  const keyOf = new Map(tcs.map((tc) => [tc.name, resultKeyOf(table, tc)]))
  for (const row of rows) {
    ws.getCell(r, 3).value = row.key
    ws.getCell(r, 4).value = row.message
    tcs.forEach((tc, i) => {
      if (keyOf.get(tc.name) === row.key) ws.getCell(r, FIRST_TC_COL + i).value = 'x'
    })
    centerTcCells(ws, r, tcs.length)
    r++
  }

  // Category: negative / valid
  ws.getCell(r, 1).value = 'Category'
  ws.getCell(r, 2).value = 'TagSection'
  styleRow(ws, r, lastCol, COLOR_SECTION, FONT_WHITE)
  r++
  const negativeKeys = new Set(rows.filter((x) => x.negative).map((x) => x.key))
  for (const tag of ['negative', 'valid']) {
    ws.getCell(r, 3).value = tag
    tcs.forEach((tc, i) => {
      const isNegative = negativeKeys.has(keyOf.get(tc.name)!)
      if ((tag === 'negative') === isNegative) ws.getCell(r, FIRST_TC_COL + i).value = 'x'
    })
    centerTcCells(ws, r, tcs.length)
    r++
  }

  // Ende
  ws.getCell(r, 1).value = '<END>'
  styleRow(ws, r, lastCol, COLOR_SECTION, FONT_WHITE)
}

// ------------------------------------------------------------------
// Ausgabe der Deckung
// ------------------------------------------------------------------

function printCoverage(table: TableDef, model: TableModel) {
  const fields = allFields(table)
  console.log(`\n${table.name}  (Execute = ${table.execute ? 'T' : 'F'})`)
  console.log(`  Kombinationen: ${fields.map((f) => f.eqClasses.length).join(' × ')} = ${model.total}`)
  for (const tc of table.testcases) {
    const target = tc.target ? `${tc.target.field}=${tc.target.eqClass}` : 'Happy Path'
    console.log(`  ${tc.name.padEnd(20)} ${String(model.products.get(tc.name)).padStart(4)}   ${target}`)
  }
  console.log(`  ${'Summe'.padEnd(20)} ${String(model.sum).padStart(4)}   = ${((100 * model.sum) / model.total).toFixed(2)} %`)
}

// ------------------------------------------------------------------
// main
// ------------------------------------------------------------------

async function main() {
  const outFile = path.resolve(import.meta.dirname, '..', 'resources', 'login-form-tests.xlsx')
  const tables = [USER, LOGIN]

  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'create-login-form-table.ts'
  for (const table of tables) {
    const model = buildModel(table)
    printCoverage(table, model)
    writeTable(workbook.addWorksheet(table.name), table, model)
  }

  await fs.mkdir(path.dirname(outFile), { recursive: true })
  await workbook.xlsx.writeFile(outFile)
  console.log(`\nGeschrieben: ${path.relative(process.cwd(), outFile)}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
