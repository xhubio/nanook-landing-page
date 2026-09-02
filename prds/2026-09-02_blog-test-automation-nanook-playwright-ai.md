# PRD: Blog Post -- "Writing Tests Got Cheap. Specifying Them Didn't."

## Metadata

| Field | Value |
|---|---|
| **Title** | Writing Tests Got Cheap. Specifying Them Didn't. |
| **Subtitle** | Test automation with Nanook and Playwright in the age of AI |
| **URL Slug** | `/blog/2026/09/02/test-automation-nanook-playwright-ai` |
| **Author** | Patrick Jerominek (changed 2026-09-02; was Torsten Link) |
| **Estimated Publish Date** | 2026-09-02 |
| **Word Count Target** | 1,100--1,400 words planned; published at ~1,750 (six sections instead of the seven-point sketch, each with its measured example) |
| **Status** | Draft — unpublished 2026-09-02 (was live the same day via the auto-commit); file kept at `blog/2026/09/02/…html` with noindex, no twin, deregistered everywhere |
| **Type** | Field report / argument |
| **Source material** | `docs/articles/2026-08-15_notes_ai-nanook-playwright.md` in github.com/xhubio/nanook-table (working notes, 2026-08-15/16) |

---

## Target Audience

- Teams that let an AI assistant write Playwright specs and wonder why the suite feels less
  trustworthy, not more
- QA engineers who know equivalence class tables and want the argument for keeping the
  specification outside the code
- Engineering leads deciding what a human should still own when a model writes the tests

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | AI test automation |
| **Secondary** | decision table testing, playwright ai generated tests, test specification, equivalence class tables |
| **Long-tail** | ai generated tests describe what the software does, keep test specification outside the code, decision tables as test oracle |

## Goal & Success Metrics

**Goal:** Make one argument and back it with one day's measured material: an AI writes test
code faster than anyone, which moves the scarce good from *writing* tests to *specifying* them.
A decision table is that specification, in a form a domain expert, a developer and a model can
all read. The post shows the drift that happens without it, what the table found that no
"write me tests" prompt would have found, and where the model is genuinely good.

**Success Metrics:**
- Organic traffic for "AI test automation" / "decision table testing" within 90 days
- CTR to the Claude Code skill post and the Quickstart >= 5 % of visitors
- Companion LinkedIn post (150--200 words, leads with the correction)

---

## Outline (follows the structure proposed in the notes, section "Structure for the news article")

### H2: The hook
- AI writes tests in seconds. That made the problem harder: whether the tests cover what
  matters, whether they still will next month, whether anyone but the author can read them.
- One-line thesis: writing got cheap, specifying didn't.

### H2: The drift
- The model adjusted seven expectations to match what the application did (three spaces
  accepted as a company name; the table said reject). The correction, quoted verbatim from
  the notes: "If the Excel says we expect a format check, then we expect one. That it isn't
  implemented is a different matter."
- Tests must describe what should happen, not what does. A model resolves "test fails, app
  passes" towards what it can observe. The table is the fixed point; a human can see the
  drift in a grid, not in 300 lines of generated code.

### H2: What a decision table is, in one grid
- Fields, equivalence classes, one column per case. Registration: three rows, four cases,
  100 % coverage. Where Playwright enters: the table produces data, the specs are generic
  functions per page, no generated `.spec.ts`.
- Composition: data tables (`Execute = F`) vs test-case tables (`Execute = T`); range
  reference `ref::User::[E_1-16]`; the secondary-data section *is* the base state.

### H2: What the table asked that nobody had answered
- "too long" forces "how long?": 894 unbounded text columns vs 192 bounded in the sampled
  schema; the registration form had no upper bound at all.
- 1168 % coverage as a structural error; the cascade fixes it (100 %, 8 of 8) -- with the
  practitioner's caveat quoted: "The cascade pattern is only an aid, and it doesn't always
  work." The coverage number is the wrong question; "does every class have its own test
  case?" is the one that produces an action.

### H2: Failing for the wrong reasons
- First browser run 18 of 18 red including the happy path: a cookie banner. An all-red
  result is a suspicion about yourself, not a finding.
- After the fix: 10 green, 10 red, 43 seconds, four distinct causes. The finding nobody
  looked for (backend knows Apple, the form doesn't). The serious one: the same e-mail
  registered twice returns 200 twice with two ids while the database holds no duplicate.

### H2: What the model is genuinely good at
- Generators, scaffolding, chasing a defect through an object graph (two defects behind
  "3 of 7 cases", found with a unit test written first, 197 tests green, 3 -> 7 of 7).
- Scope: one `noValidate` finding grepped to sixteen more forms in five products in seconds.
  The finding needed a human-shaped idea; the blast radius needed a machine.

### H2: The close
- The model's memory of its own decisions is the least durable artefact in the room: it
  regenerated a poorer version of the table it had designed that morning; the skill file
  had the answer unread. Consequences: write the format down where the work happens; read
  the existing artefact before generating; a skill file is worth nothing unread.
- The table is the shared language. Everything downstream is derived; the table is what you
  maintain.

## Internal links
- `/blog/2026/03/29/ai-assisted-equivalence-class-tables` (the skill)
- `/blog/2026/08/21/testing-a-saas-with-nanook` (the suite the day happened in)
- `/blog/2026/08/22/login-example-ai-generated-table` (worked example)
- `/docs/guide/equivalence/overview`, `/docs/quickstart/quickstart`

## CTA
- Quickstart + the Claude Code skill post

## SEO block
- Meta description (<= 160 chars): "AI test automation, measured: an AI writes Playwright tests in seconds and moves the hard part to the specification. How a Nanook decision table holds it still."
- og:type article, JSON-LD Article, author Patrick Jerominek

## Numbers used (all from the notes; re-derive before republishing)
894 / 192 unbounded vs bounded text columns (sample) · 1168 % -> 100 %, 8 of 8 · 3 -> 7 of 7
login cases · 197 tests green · 18 of 18 red, then 10 green / 10 red in 43 s · sixteen
further forms in five products · 278 formulas in
`CompanyDE`.

## Not in this post (own posts if wanted)
- The OIDC / trusted-publishing story (releases failing since June)
- The nine-answers / list-view / detector findings from the later notes

## Diagrams (added 2026-09-02, hand-maintained SVG, dark-first, CSS-inverted in light mode)

| Figure | File | Placed after | Source of the content |
|---|---|---|---|
| Where a failing test gets resolved | `img/blog/drift-fixed-point.svg` | the correction quote in "The drift" | the three-spaces company name, seven rewritten expectations (notes) |
| The test-case table names cases; the data table holds the fields | `img/blog/two-tables-registration.svg` | the "Two things made it scale" paragraph | the registration example in the skill (`SKILL.md` § Orchestrierung); the fourth column drawn as existing user + invalid input so that four columns cover the four declared combinations; `User` field names generic, no class names invented |
| Before/now: one runner | `img/blog/one-runner-vs-spec-per-surface.svg` (reused from the 2026-08-21 post) | the "Where Playwright enters" paragraph | field report |
| Why the sum can pass 100 % | `img/blog/cascade-coverage.svg` | the coverage-arithmetic paragraph | a three-field, two-class illustration (13 of 8 vs 8 of 8); the 1,168 % / 100 % / 8 of 8 figures from the notes appear only in the footnote |
| Calibrate the instrument | `img/blog/two-runs-four-causes.svg` | the "After the fix" paragraph | 18 of 18 red, cookie banner, 20 minutes; 10/10 in 43 s, causes 5/3/1/1 (notes) |
