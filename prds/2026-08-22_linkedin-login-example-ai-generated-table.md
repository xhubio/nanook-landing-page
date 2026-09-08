# LinkedIn Post -- companion to "One Login Form, Eight Test Cases: A Worked Example"

| Field | Value |
|---|---|
| **Links to** | `https://nanook.xhub.io/blog/2026/08/22/login-example-ai-generated-table` |
| **Publish** | the blog post is live (since 2026-09-02) |
| **Author** | Draft A has no first person and works from any account; Draft B is written as "we" |
| **Length** | ~180 words; LinkedIn cuts after about three lines (~210 characters), so line 1 carries the hook and the numbers on its own |
| **Purpose** | Point at the worked example. The widest audience of any Nanook post: everybody understands a login form |
| **Status** | Draft, 2026-09-08 (lektor pass applied) |
| **Ready to paste** | `assets/linkedin-login-example-ai-generated-table/linkedin-post.txt` (Draft A, plain text) |

---

## Draft A — the number that went missing (recommended)

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

## Draft B — the counter-example lead

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
comment, Patrick comments as the company; Patrick reshares. If the roles flip, swap the names, not
the texts. Ready to paste: `assets/linkedin-login-example-ai-generated-table/linkedin-comments.txt`.

### Comment 1 — Torsten Link, first comment under the post

> Two things the post does not say loudly enough. First, the discipline is the column, not the
> tool: in every error case exactly one thing is wrong and everything else is right, so a red result
> can only mean one thing. Second, the seven-of-eight is not a Nanook quirk to apologise for; it is
> what any generator pipeline does when a call fails and nobody counts. Count. The number of
> generated cases must equal the number of columns, every run.
>
> If you want to try it on your own form without cloning anything: the skill ships inside the npm
> package, and the quickstart walks through it step by step:
> https://nanook.xhub.io/docs/quickstart/claude-code

### Comment 2 — Patrick Jerominek, BeeBack UG

> What I like about this example is who can read it. The table is the specification, and it is a
> grid: fields, classes, crosses. Someone who does not write TypeScript can check whether "too long"
> means 254 or 255, and when a class is added to email, the number of cases follows on its own.
> Nobody edits a test file. That is the part that stays valuable after day one, long after these
> eight cases have run.

### Repost — Patrick Jerominek resharing the post

> Seven test cases came back instead of eight, and nothing turned red. That line is why I am
> sharing this.
>
> Torsten's worked example takes one login form from a one-line prompt to a decision table and
> generated test data, and it keeps the part where it went wrong, because a tutorial without
> friction is a demo. Two fields, one precondition, 36 combinations, 8 cases. Check the number.

German variant for a German-speaking network in the `.txt`.

Notes: every figure is from the post (7 of 8, 36, 8, 254/255, "add a class and the case count
follows"); the quickstart link in comment 1 points at the page that exists since 2026-09-02 and
says nothing the page does not verify. Comments go out within the first hour; the repost the next
day, so the post gets a second run in the feed.
