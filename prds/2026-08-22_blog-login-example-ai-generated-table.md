# PRD: Blog Post -- "One Login Form, Eight Test Cases: A Worked Example"

## Metadata

| Field | Value |
|---|---|
| **Title** | One Login Form, Eight Test Cases: A Worked Example |
| **Subtitle** | From a one-line prompt to a decision table and generated test data |
| **URL Slug** | `/blog/2026/08/22/login-example-ai-generated-table` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-08-22 |
| **Word Count Target** | 1,200--1,600 words |
| **Status** | Draft PRD |
| **Type** | Tutorial / worked example |

---

## Relationship to the existing AI post

🔴 **Read `/blog/2026/03/29/ai-assisted-equivalence-class-tables` before drafting.** That post
already covers: what the skill is, how to invoke `/createEquivalenceClassTable`, the six workflow
steps, the CASCADE marker pattern (as an abstract diagram), and what the produced Excel contains.

**Do not repeat any of it.** This post is the thing that one is missing: **a complete small example,
start to finish, with real output.** Every table and every value in this post came out of an actual
run -- see "Source material" below.

Link to the older post once, early, as "if you want the mechanics of the skill itself".

## Target Audience

- Anyone who read the skill announcement and thought "show me one"
- Testers who have never seen an equivalence class table filled in with real data
- Developers who write login tests by hand and suspect they are missing cases
- 🔵 Deliberately the widest audience of any Nanook post: **everybody understands a login form.**
  No domain knowledge required, nothing to explain before the example starts

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | login test cases |
| **Secondary** | equivalence class table example, test data generation example, decision table example, ai generated test cases |
| **Long-tail** | how many test cases for a login form, generate test data from a table, equivalence class partitioning login |

## Goal & Success Metrics

**Goal:** Make the method concrete in five minutes of reading. Someone who has never used Nanook
should finish the post able to picture their own form as a table. Top-of-funnel, and the natural
landing page for "login test cases" searches -- a query with high volume and mostly shallow results.

**Success Metrics:**
- Organic traffic for "login test cases" / "equivalence class table example" within 90 days
- CTR to Quickstart >= 6% (this is the most actionable post on the blog)
- Scroll depth past the generated-data table (the payoff)

---

## Outline

### H2: Ask for a Table

- One line: `/createEquivalenceClassTable Login Form`
- 🔵 Keep this section **short**. The mechanics live in the earlier post; here the prompt is just
  the starting gun

### H2: What Comes Back

- Show the table (see "Source material" -- use the real one, formatted as a monospace block)
- Walk through what to look at, in this order:
  1. **Two sections, not one.** `Secondary data` describes the world the test lands in;
     `Primary data` is what the form receives. The account being locked is not an input
  2. **Equivalence classes, not values.** `email` has four: valid, empty, no @, too long. Each
     stands for infinitely many concrete inputs
  3. **The generator column.** `gen:1:faker:internet.email` -- a value produced at run time, not a
     fixture checked into the repo
  4. **The markers.** `x` = use this class. `a`/`e` = the CASCADE pattern from the earlier post,
     which is why eight cases cover every class exactly once

#### H3: Read one column and the method explains itself
- Take `E_passwordTooShort`: account **active**, email **valid**, password **too short**
- **Exactly one thing is wrong; everything else is right.** That is the whole discipline of
  error-case design, and in a table you can see it at a glance instead of reasoning about it
- 💡 The counter-example everyone has written: a test with an empty email *and* a short password,
  which passes when the form rejects either one -- and therefore proves nothing about which

### H2: The Data It Generates

- Show the real 8-row output table (account / email / password / expected reaction)
- Points to make from the actual values:
  - `E_emailEmpty` has **no email key at all** -- an empty class means the field is not sent, which
    is a different test than sending `""`
  - `E_emailTooLong` is exactly **255** characters, one over the RFC 5321 limit of 254
  - The passwords are different in every row: **generated per run, not a fixture.** A test that
    hard-codes `Test1234!` passes forever after someone adds a password blocklist
  - `account` varies only in the two rows where it is the point

### H2: When Faker Is Not Enough

- 🔴 **A real limitation, stated plainly:** faker paths in a generator directive take **no
  arguments** -- the directive is split on `.` and called as a path. `string.alpha:255` throws
- What happened when we tried it: Nanook logged an error and the case **was not emitted**. Seven
  cases instead of eight
- ⚠️ **Worth saying out loud:** the error is logged, the run continues. If nothing checks the count,
  a case can disappear quietly. Check the number of generated cases against the number of columns
- The fix is ten lines -- show `GeneratorLen` in full (it is short enough to print) and the one-line
  registration
- Link to the custom generator tutorial

### H2: What the Table Is Worth After Day One

- Brief, and honest about the size of the claim. The value of eight cases is not the eight cases
- **The specification is now readable by someone who does not write TypeScript.** Add a class to
  `email` -- say "unicode domain" -- and the case count follows automatically
- **The same table drives execution.** Point at the field report post for how that works at scale;
  do not re-explain it here

### H2: Try It on Your Own Form

- Two steps: install, run the slash command against your own login page
- Explicit invitation to compare: how many cases did you have before, how many did the table produce

---

## Source material

🔴 **Everything shown in this post is a real run, not an illustration.** The artefacts are in
`prds/assets/login-example/`:

| File | What it is |
|---|---|
| `build-and-run.mts` | builds the table, runs it through `FileProcessor` + `TestcaseProcessor`, writes the output. Includes the custom `GeneratorLen` |
| `login.xlsx` | the decision table |
| `login-table.txt` | the same table as plain text -- **use this for the article's code block** |
| `generated-testcases.json` | the raw output of the run |

Re-run with `npx tsx build-and-run.mts` from inside `nanook-table` (it imports from `./src`).

⚪ The generated values change every run -- faker. When lifting the data table into the article,
take **one** run and use it consistently; do not mix values from different runs, or the
`gen:1:` instance grouping will look broken.

## Internal Links to Include

| Link Text | URL |
|---|---|
| AI-Assisted Equivalence Class Tables | `/blog/2026/03/29/ai-assisted-equivalence-class-tables` |
| Quickstart guide | `/docs/quickstart/quickstart` |
| Create an equivalence class table | `/docs/tutorials/createEquivalenceClassTable` |
| Equivalence class guide | `/docs/guide/equivalence/overview` |
| Custom generators | `/docs/tutorials/createGenerator` |
| Directives (`gen:` syntax) | `/docs/guide/directives` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |

## Call to Action

Primary CTA:
> **Point it at your own login page.** Install [Nanook](/docs/quickstart/quickstart), run
> `/createEquivalenceClassTable Login Form`, and compare the result with the login tests you have
> today. The interesting number is not how many cases it produced -- it is how many of them you
> already had.

## Technical Requirements

- **Tables:** two, and both must be **monospace blocks**, not HTML tables -- the column alignment is
  what makes them readable. (1) The decision table from `login-table.txt`, trimmed to the columns
  that fit; (2) the 8-row generated-data table.
- ⚠️ **The decision table is 8 columns wide and will not fit the blog's content width.** Either
  render it in a horizontally scrollable `<pre>` (preferred -- the reader can see it is wide, which
  is part of the point) or split it into two images. Do **not** silently drop columns.
- **Code examples:** two. The `GeneratorLen` class (~10 lines) and its one-line registration.
- **Numbers:** 8 cases, 255 characters, 254 RFC limit, 4 classes on `email`, 3 on `password`,
  3 on `account`. All verifiable from the artefacts.

### Diagrams (Excalidraw -> PNG)

**Diagram 1 (TO CREATE):** "One column = one test case"
- File: `/img/blog/login-column-to-testcase.png` + `.excalidraw`
- Content: on the left, one highlighted column of the decision table (`E_passwordTooShort`) with its
  three `x` marks; an arrow to the right leading to the generated JSON for that case. The point is
  the one-to-one mapping -- column in, test case out
- Placed at the start of "The Data It Generates"

**Style rules:** dark background (`#0A0A0A`), `#E61919` invalid, `#4CAF50` valid, `#f59e0b` caution,
`#ffffff` text, `roughness: 0`, `fontFamily: 3` (monospace). Author for the dark theme; the light
variant is derived by CSS. Keep the `.excalidraw` source next to the PNG.

## SEO Notes

| Element | Value |
|---|---|
| **Meta title** | One Login Form, Eight Test Cases: A Worked Example -- Nanook |
| **Meta description** | A complete worked example: one prompt, one decision table, eight generated test cases with real data. Everything shown is output from an actual run. |
| **og:title** | One Login Form, Eight Test Cases |
| **og:description** | From a one-line prompt to a decision table and generated test data -- including the limitation we hit and the ten lines that fixed it. |
| **og:image** | `/img/social-card.png` |
| **Schema.org type** | `Article` |
| **URL** | `https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table` |

## Notes

- **The example is small on purpose.** Resist adding fields. The moment it needs a second screen it
  stops being the post that everyone can follow -- and that reach is the whole point of choosing a
  login form.
- **The "one thing wrong per case" observation is the teaching moment**, not the tooling. If a
  reader takes away only that, the post did its job.
- **Keep the "When Faker Is Not Enough" section.** A tutorial that hits no friction reads as a
  demo. This one is honest, short, and ends with a working fix -- which is more persuasive than a
  clean run.
- ⚠️ Do **not** claim the skill produced this exact table. It was built to the skill's rules and run
  through Nanook; the prompt is shown as the entry point. If a fresh `/createEquivalenceClassTable
  Login Form` run is made before publishing, use *that* output instead and say so.
- Template of record: `/blog/2026/03/29/ai-assisted-equivalence-class-tables.html`. Registration
  checklist: `AGENTS.md`, "The six places a post must be registered".
