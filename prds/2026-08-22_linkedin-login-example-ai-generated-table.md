# LinkedIn Post -- companion to "One Login Form, Eight Test Cases: A Worked Example"

| Field | Value |
|---|---|
| **Links to** | `https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table` |
| **Publish** | the blog post is live (since 2026-09-02) |
| **Language** | German (the network is German-speaking; the linked article is English and the post says so). English versions kept as alternatives for an English-language company page |
| **Author** | Draft A has no first person and works from any account; Draft B is written as "we" |
| **Length** | ~180 words; LinkedIn cuts after about three lines (~210 characters), so line 1 carries the hook and the numbers on its own |
| **Purpose** | Point at the worked example. The widest audience of any Nanook post: everybody understands a login form |
| **Status** | Draft, 2026-09-08 (lektor pass applied; German primary since 2026-09-08) |
| **Ready to paste** | `assets/linkedin-login-example-ai-generated-table/linkedin-post.txt` (Draft A, German) · `linkedin-post-en.txt` (English) · `linkedin-comments.txt` / `linkedin-comments-en.txt` |

---

## Draft A, German — primary

> Ein Login-Formular. Zwei Felder, eine Vorbedingung. 36 Kombinationen — wie viele Testfälle?
> Acht. Der erste Lauf lieferte **sieben**.
>
> Der Einstieg ist eine Zeile: /createEquivalenceClassTable Login Form. Die Tabelle folgt den
> Regeln des Claude-Code-Skills, Nanook erzeugt die Daten.
>
> Was die Tabelle sagt: Kontozustand mit 3 Klassen, E-Mail mit 4, Passwort mit 3. Acht Spalten
> decken alle 36 Kombinationen ab — 100%, jede Klasse genau einmal. Eine Spalte lesen, und die
> Methode erklärt sich selbst: E_passwordTooShort hat ein aktives Konto, eine gültige E-Mail und
> ein zu kurzes Passwort. **Genau eine Sache falsch**, alles andere richtig. Der Test, den jeder
> schon geschrieben hat — leere E-Mail *und* kurzes Passwort — ist grün, sobald das Formular eines
> von beiden ablehnt, und beweist nichts darüber, welches.
>
> Warum sieben: Ein Generator-Aufruf warf eine Exception, der Fehler ging ins Log, der Lauf lief
> weiter. Nichts wurde rot. Wenn niemand die Zahl der erzeugten Fälle gegen die Zahl der Spalten
> prüft, verschwindet ein Fall lautlos. Der Fix: zehn Zeilen.
>
> Das vollständige Beispiel mit Tabelle, generierten Daten, der Grenze und dem Fix (auf Englisch):
>
> 👉 [link]
>
> #softwaretesting #testautomatisierung #testdesign #qa #claudecode

---

## Draft A, English — the number that went missing

> A login form. Two fields, one precondition. 36 combinations — how many test cases? Eight. The
> first run produced **seven**.
>
> One line is the entry point: /createEquivalenceClassTable Login Form. The table follows the
> Claude Code skill's rules; Nanook generates the data.
>
> What the table says: the account state with 3 classes, email with 4, password with 3. Eight
> columns cover all 36 combinations — 100%, every class exactly once. Read one column and the
> method explains itself: E_passwordTooShort has an active account, a valid email and a password
> that is too short. **Exactly one thing wrong**, everything else right. The test everyone has
> written — empty email *and* short password — passes when the form rejects either one, and proves
> nothing about which.
>
> Why seven: a generator call threw, the error went to the log, the run continued. No red light.
> If nothing checks the count of cases against the count of columns, a case disappears quietly.
> The fix was ten lines.
>
> The full example — table, generated data, the limitation and the fix:
>
> 👉 [link]
>
> #softwaretesting #testdesign #testdata #qa #claudecode

---

## Draft B, English — the counter-example lead

> The login test everyone has written: empty email *and* a short password. It passes when the
> form rejects either one. It proves nothing about which.
>
> An equivalence class table makes that mistake hard to make. One column per case, and each error
> column has **exactly one thing wrong**. For a login form that is 8 columns for 36 combinations,
> 100 % coverage — and you see it in a grid instead of reasoning about it.
>
> We drafted the table to the Claude Code skill's rules and let Nanook generate the data: a
> 255-character email (one over the RFC limit), a case where the email key is missing rather than
> empty, passwords generated per run rather than a fixture — a hard-coded Test1234! stays green
> after someone adds a blocklist it happens not to be on.
>
> One honest number: the first run gave us 7 cases, not 8. A generator call threw, the error sat in
> the log, nothing turned red. **Check the number.**
>
> 👉 [link]
>
> #softwaretesting #testdesign #testdata #qa #claudecode

---

## Visual assets

### Option 1 — single image (recommended)

| | |
|---|---|
| Source | `assets/linkedin-login-example-ai-generated-table/linkedin-single.svg` |
| Rendered | `assets/linkedin-login-example-ai-generated-table/linkedin-single.png` — 1200×1200 |
| Re-render | `qlmanage -t -s 1200 -o <dir> <dir>/linkedin-single.svg`, then drop the `.svg` from the name |

**What it shows:** the three figures (36 combinations / **8** cases / **7** in red — the last is
the statement), the headline *"Check the number."*, and a panel with the column
`E_passwordTooShort` — account active, email valid, password too short, marked right / right /
wrong — captioned "exactly one thing wrong".

### Option 2 — reuse the blog diagram

`/img/blog/login-column-to-testcase.svg` (one column → one generated test case). It is
dark-first; export a PNG before uploading, LinkedIn does not take SVG.

## Notes

- 🔵 **Draft A is recommended**: the 7-of-8 story is the reason to click, and "how many test cases
  for a login form" is the search question the post targets. Line 1 carries the question and the
  three numbers because reshares and notifications show neither the image nor the rest. Draft B is for an audience that
  already writes tests and will recognise the counter-example.
- 🔴 **Do not say the skill produced this exact table.** The blog post is careful about it ("built
  to the skill's rules and run through Nanook"); both drafts keep that wording.
- **All numbers are from the post**: 3/4/3 classes, 36 combinations, 8 cases, 7 on the first run,
  255 characters vs. the 254-octet RFC 5321 limit, ten-line fix (`GeneratorLen`).
- LinkedIn strips formatting: the ready-to-paste `.txt` uses plain text and CAPITALS where the
  drafts use bold; check the paste before posting. "100%" without a space, or LinkedIn may break
  the line between the number and the sign.
- The files for this post live in `assets/linkedin-login-example-ai-generated-table/`.
- Optional second link once the reader is hooked: the new
  `https://nanook.xhub.io/docs/quickstart/claude-code` (skill copied from the npm package, no clone).

---

## Comments and repost

Assumed roles: the post goes out from Torsten's account (blog author); Torsten adds the first
comment, Patrick comments as the company; Patrick reshares the next day. If the roles flip, swap
the names, not the texts. Ready to paste: `assets/linkedin-login-example-ai-generated-table/linkedin-comments.txt`
(German) and `linkedin-comments-en.txt` (English).

### Kommentar 1 — Torsten Link, erster Kommentar unter dem Post

> Zwei Dinge, die der Beitrag nicht laut genug sagt. Erstens: Die Disziplin steckt in der Spalte,
> nicht im Werkzeug. In jedem Fehlerfall ist genau eine Sache falsch und alles andere richtig, also
> kann ein rotes Ergebnis nur eines bedeuten. Zweitens: Die sieben von acht sind keine
> Nanook-Eigenheit, für die man sich entschuldigen müsste. Das passiert in jeder
> Generator-Pipeline, wenn ein Aufruf scheitert und niemand zählt. Also zählen. Die Zahl der
> erzeugten Fälle muss der Zahl der Spalten entsprechen, bei jedem Lauf.
>
> Wer es am eigenen Formular ausprobieren will, ohne etwas zu klonen: Der Skill liegt im
> npm-Paket, und der Quickstart führt Schritt für Schritt durch:
> https://nanook.xhub.io/docs/quickstart/claude-code

### Kommentar 2 — Patrick Jerominek, BeeBack UG

> Was mir an dem Beispiel gefällt, ist, wer es lesen kann. Die Tabelle ist die Spezifikation, und
> sie ist ein Raster: Felder, Klassen, Kreuze. Wer kein TypeScript schreibt, kann trotzdem prüfen,
> ob „zu lang“ 254 oder 255 heißt, und kommt bei der E-Mail eine Klasse dazu, folgt die Zahl der
> Fälle von selbst. Niemand fasst eine Testdatei an. Das ist der Teil, der nach dem ersten Tag
> wertvoll bleibt, lange nachdem diese acht Fälle gelaufen sind.

### Repost — Patrick Jerominek teilt Torstens Beitrag

> Sieben Testfälle statt acht, und nichts wurde rot. Wegen dieser Zeile teile ich den Beitrag.
>
> Torstens Beispiel führt ein Login-Formular von einem einzeiligen Prompt zur Entscheidungstabelle
> und zu generierten Testdaten, und es lässt die Stelle drin, an der es schiefging, weil ein
> Tutorial ohne Reibung nur eine Demo ist. Zwei Felder, eine Vorbedingung, 36 Kombinationen,
> 8 Fälle. Zähl nach.

English versions of all three in `linkedin-comments-en.txt`.

Notes: every figure is from the post (7 of 8, 36, 8, 254/255, "add a class and the case count
follows"); the quickstart link in comment 1 points at the page that exists since 2026-09-02 and
says nothing the page does not verify. Comments go out within the first hour; the repost the next
day, so the post gets a second run in the feed. The image keeps "Check the number." in English;
switch the headline to "Zähl nach." in `linkedin-single.svg` if the post should be German
throughout.
