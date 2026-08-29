# PRD: Blog Post -- "Testing E-Invoices for 40 Country/Format Combinations"

## Metadata

| Field | Value |
|---|---|
| **Title** | Testing E-Invoices for 40 Country/Format Combinations |
| **Subtitle** | The 105,000 cases that never ran, and the eight data losses nobody had noticed |
| **URL Slug** | `/blog/2026/08/29/e-invoicing-decision-tables` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-08-29 |
| **Word Count Target** | 2,200--2,800 words |
| **Status** | Draft PRD |
| **Type** | Field report / case study |

---

## Target Audience

- Teams building against a **standard** rather than a spec of their own -- e-invoicing, payments,
  healthcare, anything with a normative document and national variants
- QA engineers whose test suite is green and who suspect that says less than it should
- Engineering leads facing combinatorics: *n* countries x *m* formats x *k* rules, and no way to
  write that by hand
- Readers of the previous field report who want the harder version: not one app, but 40 variants
  of the same domain

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | specification based testing |
| **Secondary** | decision table testing, e-invoicing test automation, combinatorial test design, EN 16931 testing, test oracle |
| **Long-tail** | how to test against a specification, generate test cases from a standard, peppol test cases, schematron rules testing |

## Goal & Success Metrics

**Goal:** Show what decision tables do when the domain is *large and normative*. The previous field
report showed one SaaS moving from spec files to tables. This one starts where that ends: the
subject is a European standard (EN 16931) with dozens of national variants, and the question is not
"how do we write these tests" but "how do we know we covered the standard rather than our own code".

The post must be honest about the wrong turns. The most useful part is not the 105,000 number -- it
is the four derivations we built, measured, and threw away.

**Success Metrics:**
- Organic traffic for "specification based testing" / "decision table testing" within 90 days
- CTR to Quickstart >= 5%
- Time on page > 5 min (long-form, technical)
- Cited by at least one e-invoicing / Peppol community source

---

## Outline

### H2: The Subject: One Standard, Forty Dialects

- EN 16931 is the European standard for electronic invoices. Every country adds a CIUS
  (a national narrowing) on top: XRechnung in Germany, FatturaPA in Italy, CIUS-RO in Romania,
  Peppol BIS across the network, PINT in Japan, Oman and the UAE
- What that means concretely: **40 country/format combinations**, each with its own rule book, each
  rule book with hundreds of Schematron rules
- The rules are not prose. They are executable XPath assertions, versioned and pinned
- 🔴 Frame the real problem early: *combinatorics is not the hard part.* Generating 100,000 cases is
  easy. Knowing that they test **the standard** and not **our implementation of it** is the hard part

### H2: The Oracle Problem, in One Measurement

- Before the tables, we had 726 green assertions on the German invoice type code. All of them
  checked `InvoiceTypeCode = 380`
- 380 is our **default**. The assertions confirmed that our default arrives -- for every input
- Then a customer asked for partial invoices, which XRechnung's `BR-DE-17` codes as **326**.
  726 green tests, and not one of them had ever seen the case
- 🔴 The rule that follows, and it is the whole point of the post:
  > **The expected value comes from the pinned specification artefact -- Schematron, XSD, code
  > list -- never from a constant in `src/`.** A test built from our own code confirms our code.
  > A test built from the specification finds the bug in it.
- Worse: the allow-list in our code had been *transcribed by hand* from the Schematron. It contained
  **386**, a code `BR-DE-17` does not know. No test ever compared the transcript with the source

### H2: What a Table Looks Like When the Rules Are the Input

#### H3: One sheet per rule area, one column per case
- Sheet skeleton: base variant (which invoice we start from) / the business terms (BT-1, BT-5,
  BT-31 ...) / the expected reaction
- A class is not "valid/invalid". It is a **grip**: `omit`, `too-long:100`, `not-in-list`,
  `wrong-value`, `value-limit:-1`, `group-removed:BG-8`
- The grip is derived **from the rule's test expression**, not written by hand:
  `string-length(...) <= 100` becomes `too-long:100`, `count(...) <= 1` becomes `too-many:1`
- Show the skeleton as a monospace block -- the `x` / `a` / `e` alignment carries the meaning

#### H3: The CASCADE triangle, and why 0.03% was the most useful number of the project
- 🔴 The story, told plainly, because it is the lesson: a script generated 819 sheets. From then on
  we worked **on the script**, and the table was rewritten on every run
- The table had become a *printout*. Nobody read it any more
- When we finally opened the workbook in Excel, it said **0.03% coverage**. The CASCADE triangle --
  the `a`/`e` markers that make the products of the equivalence classes sum to the whole -- was
  missing entirely
- 💡 The direction is the point: *a table a human reads and edits is a conversation about test
  cases. A script that emits tables is a monologue -- and a bug in the script always looks correct
  in the script's own output*
- The rule we now write down: **the table is the source, not the generator's output.** The test:
  *change a cell, re-run the generator -- is your change still there?*

#### H3: Multiplicity, or: one code is not a code list
- ISO 4217 has 178 currency codes. Writing 178 columns is absurd; writing one is a lie
- Nanook's `MultiplicitySection` clones a case definition *n* times (`tc.1` ... `tc.n`) and the
  generator walks the list -- one class, every code
- This is where the numbers move: the same table goes from *a few thousand* to **105,000** cases
  without a single new column

#### H3: The 105,000 that never ran

- 🔴 The best story in the piece, and it lands here: for weeks the workbooks *said* 105,000
  cases. The suite ran **13,042**
- `multiplicity` was written onto the **referenced data sheets** — 52 document types, 179
  currencies, 200 country codes, all correct. The **executing** sheet carried `1` everywhere
- nanook clones where it *generates*. Result: **zero clones**, and from every code list exactly
  **one** code was ever tested
- 💡 The rule that came out of it: *what a referenced sheet says about **values** holds; what it
  says about the **number of cases** has to reach the generator*
- After lifting it to the executing sheet: **13,042 → 88,609** cases (76,253 clones)
- ⚠️ How it was found is the transferable part: raising the sample from 400 to 2,500 left the
  test count **bit-identical**. The same signature as the `slice(0, n)` bug earlier in the
  project. **When a number does not move although it should, suspect the instrument, not the
  thing**
- The counter-check, because clones that repeat themselves are idle work: 32 clone groups, none
  with identical documents (`EN_Seller_E_14`: 200 clones, 200 distinct invoices). A guard holds
  that, verified by switching the instance number off — it goes red and names the group

### H2: Three Run Levels, Because 105,000 Is Not a CI Job

| Level | Where | Cases | Duration |
|---|---|---|---|
| `smoke` | CI on every push | **191** | 21 s |
| `extended` | local, pre-push hook (default) | **3,688** | ~4 min |
| `full` | before a production release | **~105,000** | ~3 h |

- The team decision behind it, quoted: *"CI should have a sample, not the 6,500. Fifty is enough.
  Locally, everything must run."*
- 🔴 The mistake we made here is worth more than the table: the sample took the **first** 80 cases
  per kind. After we added two new grips (+72 cases), the number of executed tests stayed
  **bit-identical**
- The sample was blind to every addition -- and the measurement *confirmed the error* instead of
  showing it. The fix is one line: every k-th case, deterministic (a red sample must be
  reproducible), never random
- Immediate yield after the fix: two failures the first-80 would never have reached

### H2: What It Caught

The tables were built to prove conformance. What they actually found was that **fields we accept
never reach the document**. Eight of them, each confirmed with a 200 response:

| Lost field | Where |
|---|---|
| **BG-10** Payee | 29 Peppol generators + SI-UBL, BG-UBL, RO-eFactura |
| **BG-11** Seller tax representative | the same, plus the CII path -- in the entire tree, **one** generator knew it |
| **BT-28** Trading name | RO wrote the *legal* name twice |
| **BT-36** Address line 2 · **BT-12** Contract reference | RO, missing entirely |
| **BT-14** Sales order reference | 35 files build `cac:OrderReference`, **none** wrote `cbc:SalesOrderID` |

- Why this matters beyond conformance: **BG-11 is mandatory in several EU states** for non-resident
  sellers. Without it the invoice is factually wrong -- and nobody notices, because the transfer
  succeeds. **BG-10** says *where to pay*; drop it and the customer pays the seller instead of the
  factor, and the receivable stays open
- Two further findings, filed rather than fixed: `normalizeUnitCode` maps **any** unknown unit to
  `C62` ("piece"), and an unfitting tax category is silently replaced by a default. Garbage in,
  valid invoice out

### H2: Four Derivations We Built, Measured, and Deleted

This is the section that makes the post worth reading. Each was plausible; each was wrong; the
**run** is what said so.

1. **The context bridge.** Rules that name no business term in their text do name an XPath in their
   context. Map context -> term -> input field. Measured: 14 of 56 mapped, several wrong. Deleted.
   🔵 *Re-measured a day later after we fixed the rule source: **491 of 764**. The reason for
   rejection had never been the bridge -- it was a broken input.* **A discarded derivation deserves
   re-measuring the moment its input changes.**
2. **The group grip on categories.** Removing a group to break a rule -- correct for BG-8 (buyer
   address), wrong for 231 rules where the group is merely the *scene*: removing it satisfies the
   condition trivially and the case goes green having tested nothing
3. **Reason codes by index.** `BT-98` is the allowance reason, `BT-105` the charge reason; their
   paths assumed *order* (`.0` = allowance, `.1` = charge) rather than identity. A grip that hits
   the wrong entry one time in two is not coverage
4. **The note subject code.** `BR-CL-08` wants the code from UNCL 4451, carried as `#AAI#` inside
   the note text. Faking that prefix looked airtight -- and failed in **102 of 117** cases: our
   `notes` is free text, the generator passes it through verbatim, the convention does not exist
   in our model

- 💡 The pattern across all four: **the mapping was right and the effect was not.** Only the run
  tells them apart. The cheapest instrument for that turned out to be raising the sample size once
  (80 -> 400) and reading what falls out

### H2: The Ratchet That Read Progress as Regression

- We guard the numbers: "unreachable classes" may only fall
- Then it rose by exactly 1 in **all 36** families -- because two new grips reached more rules, and
  each touched one more field our base data does not carry
- 🔴 A single upper bound cannot tell progress from regression. Worse, it can be lowered by
  **leaving cases out**
- The fix is two numbers: a **ceiling** that may only fall, and a **floor** of executable violation
  cases that may only rise

### H2: What the Numbers Say Now

| | |
|---|---|
| Country/format combinations | **40** |
| Sheets | **822** |
| Equivalence classes | **35,117** (20,757 good cases, 14,360 violations) |
| Cases in the workbooks | **27,044** |
| Cases the suite builds | **88,609** (76,253 of them multiplicity clones) |
| Rules still without a case | **7,101** |

- 🔴 Be honest about that last row, and use it to make the strongest point in the post: **two thirds
  of it is not work.** 2,447 are German rules in a Dutch family. 706 are Spanish tax categories in a
  German one. 379 are structurally unbreakable because the generator rounds every amount to two
  decimals. A case for any of them would be **wrong**, not missing
- And the rest is not a test problem either: **91 of 201 business terms have no input field at
  all.** Line-level allowances (BG-27/BG-28) do not exist in our model -- there is a single
  `discount: {type, value, reason}`. Those rules need a **feature**, not a grip
- 💡 The most valuable output of the exercise was not the coverage number. It was learning to say
  which part of the gap is testing work and which part is product work

### H2: Then We Added the Missing Fields — and Four More Rules Bit

Once the tables showed which business terms the input never carried, the fix was a **feature**,
not a test: 91 of 201 terms had no input field. Line-level allowances (BG-27/BG-28) did not
exist at all. Three plans, three releases — and the moment those fields were rendered for the
first time, four national rules objected:

| Rule | What it wanted |
|---|---|
| `BR-NL-28` | The Netherlands **forbids** `CountrySubentity`. A perfectly good `state` turned two cases red |
| `IS-R-002/004` | A real Icelandic kennitala. `REG-INV-2026-IS-001` did not pass |
| `DK-R-017` | `schemeID="0184"` alongside the Danish CVR — the number alone is not enough |
| `PEPPOL-EN16931-R120` | Line net must carry its allowances and charges. **An amount cannot be added on its own** |

💡 The lesson generalises past invoicing: **a field the generator used to discard becomes a new
assertion the first time it is written** — and a national profile may forbid it.

🔴 And the sharpest find came free. `lib-invoice-outbound-fr/ubl.ts` called the same builder
**twice** — copy-paste, identical comment, two lines apart. `UBL-SR-04` is fatal. It had sat
there for months without a single failure, because without a value the block writes nothing:
**twice nothing does not show up.** Only when the fixture finally carried BT-18 did dead code
turn into a red test.

### H2: What We Would Tell Someone Starting This

1. **Pin the specification, then read it.** Every expected value traces to a file with a SHA. If it
   traces to a constant in `src/`, you are testing a transcript
2. **Open the workbook.** Read coverage in the file, not in the generator log. Our 0.03% was in the
   file; the log said nothing
3. **Let the sample scatter.** `slice(0, n)` goes blind the moment you add anything
4. **Give every guard a counter-metric.** One number can always be gamed by removing cases
5. **Re-measure what you discarded.** Four derivations died here; one came back and now carries 491
   mappings
6. **Fill the fixture before you trust the coverage.** Half our findings were fields the input
   never carried — and an empty field cannot fail a test, however many rules point at it

---

## Internal Links to Include

| Link Text | URL |
|---|---|
| Quickstart guide | `/docs/quickstart/quickstart` |
| Equivalence class guide | `/docs/guide/equivalence/overview` |
| Create an equivalence class table | `/docs/tutorials/createEquivalenceClassTable` |
| Multiplicity sections | `/docs/guide/multiplicity/overview` |
| Matrix tables | `/docs/guide/matrix/overview` |
| Custom generators | `/docs/tutorials/createGenerator` |
| How We Test a SaaS Application with Nanook | `/blog/2026/08/21/testing-a-saas-with-nanook` |
| AI-Assisted Equivalence Class Tables | `/blog/2026/03/29/ai-assisted-equivalence-class-tables` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |

## Call to Action

Primary CTA:
> **If your domain has a specification, your test oracle is already written -- in someone else's
> repository.** Start with the [Quickstart](/docs/quickstart/quickstart), then read the
> [multiplicity guide](/docs/guide/multiplicity/overview): it is the difference between testing one
> currency code and testing all 178.

Secondary CTA:
> Building against EN 16931, Peppol or a national CIUS? We would like to compare notes -- the hard
> part is never the XML.

## Technical Requirements

- **Tables:** four. (1) The three run levels -- must be scannable, it is the most quoted table.
  (2) The eight lost fields. (3) The current numbers. (4) The rejected derivations may stay a
  numbered list, not a table -- each needs a sentence, not a cell
- **Monospace block:** the sheet skeleton with `x` / `a` / `e` markers. Not an HTML table; the
  alignment is the content
- **Code examples:** at most three, one sentence each -- the grip derived from a test expression
  (`string-length(...) <= 100` -> `too-long:100`), the scattered sample (3 lines), the two-number
  ratchet (2 lines)
- 🔴 **Numbers:** every figure in this PRD is measured, not estimated. Re-derive before publishing.
  If a figure cannot be re-derived, drop the sentence rather than adjust the figure

### Diagrams (Excalidraw -> PNG)

**Diagram 1 (TO CREATE):** "Where the expected value comes from"
- File: `/img/blog/test-oracle-spec-vs-code.png` + `.excalidraw`
- Content: left -- a test drawing its expectation from `src/constants.ts` (orange), arrow looping
  back to the same codebase, caption "confirms the code"; right -- a test drawing from a pinned
  `.sch` file (green), caption "finds the bug in the code". Between them the 726/326 example
- Placed after H2 "The Oracle Problem, in One Measurement"

**Diagram 2 (TO CREATE):** "One class, 178 codes"
- File: `/img/blog/multiplicity-one-class-many-codes.png` + `.excalidraw`
- Content: left -- one column, one currency code, caption "a lie"; middle -- 178 columns, caption
  "absurd"; right -- one column with a multiplicity marker fanning out into `tc.1 ... tc.178`
- Placed in H3 "Multiplicity, or: one code is not a code list"

**Diagram 3 (TO CREATE):** "Where multiplicity has to sit"
- File: `/img/blog/multiplicity-executing-sheet.png` + `.excalidraw`
- Content: left -- a referenced data sheet (`execute: F`) carrying "200", an arrow to the
  executing sheet carrying "1", and a single case coming out (orange, caption "one country code
  tested"); right -- the same with "200" on the executing sheet, fanning into `tc.1 … tc.200`
  (green). Underneath, one line: *what a referenced sheet says about values holds; what it says
  about the number of cases has to reach the generator*
- Placed in H3 "The 105,000 that never ran"

**Diagram 4 (TO CREATE):** "Ceiling and floor"
- File: `/img/blog/ratchet-ceiling-and-floor.png` + `.excalidraw`
- Content: a band between two lines -- upper line "unreachable classes, may only fall", lower line
  "executable violations, may only rise"; an arrow of progress that raises both, shown as
  acceptable
- Placed in H2 "The Ratchet That Read Progress as Regression"

## SEO Notes

- The primary keyword "specification based testing" is under-served: most results are academic.
  A field report with real numbers has a genuine chance
- "EN 16931 testing" and "Peppol test cases" are low-volume but extremely high-intent -- worth
  their own H2 mentions, which the outline already carries
- Meta description draft: *"Forty country and format combinations, 35,117 equivalence classes, and
  eight fields our API accepted but never wrote. A field report on testing against a specification
  rather than against your own code."*

## Notes

- **Tone:** field report, past tense, no hedging. The four rejected derivations are the credibility
  of the piece -- do not soften them into "learnings"
- **Do not** turn the eight data losses into a vendor-shaming section. They are our own generators;
  that is exactly why the story lands
- The companion LinkedIn post should lead with the 726/326 measurement, not with 105,000 -- the
  oracle problem is the part that transfers to readers who will never touch an invoice
