# Series Plan — Agentic Software Development

Source: `2026-09-17_full-report_agentic-software-development.md` (the full report, ~9,400 words).

The full report is cut into **nine blog posts**. Each post stands on its own (short recap of context in
the first paragraph, no "as we saw in part 3" dependencies) and links to the previous and next part
and to the series overview. Each post has one LinkedIn companion post.

Conventions from `AGENTS.md` apply to every part: English; technical and specific; numbers and
limits stated; Nanook introduced where it answers the problem, not in the lede; six registration
places; Lektor pass before pushing. A PRD per part goes into `prds/` before drafting the HTML.

Suggested rhythm: one part per week, Tuesday or Wednesday morning. Part 1 first; the order of
parts 8 and 9 can be swapped.

---

## Overview

| # | Title (working) | Slug | Report sections | Length |
|---|---|---|---|---|
| 1 | The agent writes the code. Everything around it decides whether you can trust it. | `agentic-development-overview` | 1, 2, 23 | ~1,300 w |
| 2 | Fewer skills, shorter rules: setting up a coding agent that does not drown in its own instructions | `agent-toolbox-and-instruction-file` | 3, 4, 21 | ~1,600 w |
| 3 | One root, many repositories: a directory layout and a requirements lifecycle for agent work | `directory-layout-requirements-lifecycle` | 5, 6 | ~1,700 w |
| 4 | What the next session knows: a knowledge base and a memory of lessons | `knowledge-base-and-lesson-memory` | 7 | ~1,100 w |
| 5 | A table cannot stay silent: finding contradictions in requirements before any code exists | `requirements-into-decision-tables` | 8, 9 | ~1,600 w |
| 6 | Tests first, then "implement all plans": designing services an agent can verify | `tests-first-red-chain` | 10, 11 | ~1,800 w |
| 7 | Working through 1,200 plans: a pipeline, a ledger, and many repositories | `plan-pipeline-and-release-cascades` | 12, 13, 19 | ~2,000 w |
| 8 | The agent that pleases: absences, lying instruments, and invented evidence | `where-agentic-development-breaks` | 14, 15, 16, 17 | ~2,200 w |
| 9 | Rules need exit codes, and green is not useful: what still went wrong | `rules-need-exit-codes` | 18, 20, 22 | ~1,700 w |

Existing, already written, to be linked from parts 5 and 6:
- `2026-09-16_blog_dienst-mit-ki-und-tabellen.md` (field report, event-driven service) — German, needs translation before publishing.
- `2026-09-16_leitfaden_event-driven-service.md` (step-by-step guide) — German, needs translation before publishing.

Recommendation: publish the translated field report as **part 5b** directly after part 5, and the guide
as a standalone reference post linked from part 6.

---

## Part 1 — The agent writes the code. Everything around it decides whether you can trust it.

**Content:** Why speed is the uninteresting part. The two settings with their numbers (SaaS platform:
74 repositories, ~14,000 commits, ~1,240 completed plans, 327 lessons; service: 11 days, 806 tests,
214 generated cases). The ten sentences from "The short version" as a teaser table of contents for the
series.

**Hook for the reader:** "What this series will and will not tell you."

### LinkedIn post (Part 1)

> For nine months, an AI agent has written nearly all of our code.
>
> 74 repositories. ~14,000 commits. ~1,240 completed plans. And, in a separate client project, an
> event-driven service in eleven days with 806 tests.
>
> The speed is real. But it is the least interesting part.
>
> What decides whether you can trust the result is everything **around** the agent:
>
> • the structure it works in
> • the order of the steps
> • the checks it cannot talk its way past
> • the knowledge that survives the end of a session
>
> Every rule in our setup exists because something went wrong — usually more than once. An agent that
> rewrote expectations until tests passed. A request counter that reported zero while the page fired
> 150 batches a second. Five bypassed test hooks, despite an explicit prohibition in every brief.
>
> I am writing it all down in a nine-part series: setup, process, tables, tests, automation — and at
> length, the failures.
>
> Part 1: the overview and the numbers.
>
> 👉 [link]
>
> #softwareengineering #ai #aiagents #claudecode #softwaretesting

---

## Part 2 — Fewer skills, shorter rules

**Content:** Superpowers as a starting point, adapted per project. Project-specific skills. Playwright
MCP and one browser per parallel session. The token diet: 14 skills unused in 91 sessions → archived.
The instruction file: 170 lines, one sentence per rule, long versions in path-bound rule files.
Cost: weekly limit after three days, orchestrator at 30 %, model assignment, max three sub-agents.

### LinkedIn post (Part 2)

> Every skill you install for your coding agent costs tokens on **every single request** — whether you
> use it or not.
>
> We measured it: 14 skills had not been invoked once in 91 sessions over a month. Five of them were
> process skills I actually like. They went into an archive folder with a note on how to bring them
> back.
>
> Same problem with the instruction file. Every incident adds a paragraph, until nobody — including the
> agent — reads it properly.
>
> Ours is now 170 lines. Each hard rule is **one sentence**: the sentence on which the rule holds or
> fails. The long version, with rationale and precedents, lives in a separate file that loads **only**
> when the agent touches a matching path. The testing rule loads near tests. The migration rule near
> migrations.
>
> And one number that changed how we assign models: our orchestrator on the most expensive model used
> 30 % of the weekly budget by itself.
>
> The cheapest token is the one that never enters the context.
>
> Part 2 of the series on agentic software development:
>
> 👉 [link]
>
> #aiagents #claudecode #developerproductivity #llm #softwareengineering

---

## Part 3 — One root, many repositories

**Content:** The root directory is a repository (4,284 commits of plans, rules and decisions). Layout for a
multi-product SaaS with shared modules versus an event-driven microservice landscape (requirements per
service). File-name pattern `<yyyy-mm-dd>_<analyse|design|plan>_<topic>.md`. Lifecycle: analysis when
nothing is known, otherwise design; for a new service first an outline of designs that sets the order;
review after every design; decision tables early; plans after all designs; the ripple effect of planning
back into designs; design → done when plans exist; plan → done and into the knowledge base when implemented;
blockers leave the plan.

### LinkedIn post (Part 3)

> Where do plans live when an AI agent does the implementation?
>
> In our case: in a Git repository of their own. The root directory above all code repositories holds
> the agent's rules, the architecture docs, and every analysis, design and plan. It has more commits than
> most of the code repositories — because I want to see *when* a rule appeared and *which incident*
> caused it.
>
> The lifecycle is simple and strict:
>
> 1️⃣ **Analysis** when I know nothing yet
> 2️⃣ **Design** — for a new service, first an *outline* of the designs we will need. The outline sets the order.
> 3️⃣ A **review** after every design
> 4️⃣ **Plans** once all designs exist
> 5️⃣ **done/** — the design when its plans exist, the plan when it is implemented
>
> The part nobody tells you: writing the plans changes the designs. Almost every time. A column nobody
> modelled, an interface two designs assume differently. Those changes ripple forward — and backward.
>
> And one rule that sounds like bookkeeping but is not: a finished plan left in `plan/` gets implemented
> again.
>
> Part 3: directory layout and requirements lifecycle, for a multi-product SaaS and for event-driven
> microservices.
>
> 👉 [link]
>
> #softwarearchitecture #aiagents #requirementsengineering #devops

---

## Part 4 — What the next session knows

**Content:** Two stores for two questions. The knowledge base (own repository, raw → compiled wiki, one
concept per file, dated, lint; topics development, test, deployment, production; target environment;
MCP access). The lesson memory (327 entries, one lesson per file, mechanism not incident, ~20 failure
classes). The fourth attempt: a lesson solved locally comes back. Memories go stale.

### LinkedIn post (Part 4)

> An AI agent session starts empty. Every single time.
>
> So the most important question in agentic development is not "how good is the model?" but
> **"what will the next session know?"**
>
> We keep two stores, because they answer two different questions:
>
> 📚 **A knowledge base** — how does our system work? Its own repository. I feed raw material in, the model
> compiles it into short, dated articles: development, test, deployment, production. Every completed plan
> contributes.
>
> 🧠 **A lesson memory** — what went wrong, and how do we avoid it? 327 entries now, one lesson per file,
> each with *what happened*, *why*, and *how to apply*.
>
> The most useful discovery: after a few hundred lessons, incidents cluster into about twenty failure
> classes. "The measuring instrument lies." "Silent data loss." "Built but not reachable."
>
> And the most humbling one: the same mistake had been fixed three times — each time with a comment in the
> file concerned. A comment protects the file it is in. Only when it became a rule did it stop.
>
> Part 4 of the series:
>
> 👉 [link]
>
> #knowledgemanagement #aiagents #llm #softwareengineering

---

## Part 5 — A table cannot stay silent

**Content:** Project work versus open product work. In a project: analyse the specification, translate it
into equivalence-class tables with the Nanook skill. Decision table versus matrix table. Why tables find what
an AI reading prose does not. The eight findings in the event-driven service (contradiction between artefacts,
seven ineffective filters, a combination without answer, a hidden state, 50 vs. `LIMIT 20`, a misnamed event,
columns demanded by cells, ignore versus error). The three table rules from the SaaS platform.

**Nanook placement:** introduced in section two of the post, where the table form answers the problem.

### LinkedIn post (Part 5)

> An AI agent can read a 40-page specification and summarise it perfectly.
>
> It will not tell you that page 12 and page 31 contradict each other in a case nobody spelled out.
>
> So the first thing I do with a new specification is have the agent translate it into **decision
> tables**. A table demands three things prose does not: every field needs classes, every combination
> needs a row, every row needs a result.
>
> For an event-driven service, with twelve good designs already written, building the tables found — before
> a single line of code:
>
> • a contradiction between two of our own documents
> • seven filters with no effect, despite tests against a real database
> • 50 rows per page in the UI, `LIMIT 20` in the database design
> • an event whose name would have produced an outbound message that must not exist
> • two database columns that no design had asked for
>
> Prose does not lie. It stays silent — exactly where the work is.
>
> A table cannot stay silent.
>
> Part 5 of the series on agentic software development:
>
> 👉 [link]
>
> #softwaretesting #requirementsengineering #testdesign #aiagents #nanook

---

## Part 6 — Tests first, then "implement all plans"

**Content:** Service design independent of transport (ports, thin adapters); why this matters more with an
agent (it can verify itself after every step). Five stages with a prohibition each. The red chain: contract
with one "not implemented" constant, oracle, all tests red with the identical message (245). "Implement the
plans, use the tests." 280 green with zero changed expectations. The rule: change the table first, with a
reason. Counter-probes with counted results.

### LinkedIn post (Part 6)

> The best instruction I have found for an AI coding agent is nine words long:
>
> **"Implement the plans. Use the tests to check the result."**
>
> It only works if two things are true before you say it.
>
> 1️⃣ **The service is testable without its infrastructure.** The business logic must not care whether an
> event comes from Kafka or REST. Transport is an adapter at the edge. Then every business test runs in
> seconds — and the agent can check its work after every single step.
>
> 2️⃣ **All tests exist and are red for the right reason.** Every function throws "not implemented" with the
> same wording. In our service: 245 tests red, all with the identical message. That is the only moment you
> can prove your tests assert something.
>
> Then the agent implements. After the business-logic stage: 280 tests green — **without a single expectation
> changed**.
>
> Because of one rule: when a test is red, change the code. If you want to change the expectation, change the
> table first, and write down why.
>
> Part 6:
>
> 👉 [link]
>
> #tdd #softwaretesting #eventdriven #aiagents #softwarearchitecture

---

## Part 7 — Working through 1,200 plans

**Content:** The plan pipeline: audit against the code, implement per step via sub-agents, release, move to
done. The ledger: status vocabulary, immediate writes, write-ahead `IN FLIGHT`, size in bytes, head-only resume.
Model assignment and delegation threshold. "A decision is the go." App parity and release cascades across 74
repositories; the push gate; a green CI run without a release publishes nothing. Parallel sessions in one
checkout: foreign commits, `git add -A`, stash, silent agents; push ban, worktrees, liveness on the process.

### LinkedIn post (Part 7)

> What happens when an AI agent session dies in the middle of implementing plan 37 of 60?
>
> In our setup: almost nothing is lost. Because every status change goes into a **ledger** on disk
> immediately — and *before* every sub-agent starts or every push runs, a line goes into an "in flight"
> table. A non-empty "in flight" table at startup always means: a turn died here. Check Git. Git is the truth.
>
> That ledger is how an autonomous pipeline has worked through ~1,240 plans across 74 repositories.
>
> The harder lessons were about **parallel sessions**:
>
> ⚠️ Two sessions, one checkout. Twenty minutes after a clean check, five foreign unpushed commits. One push
> would have released someone else's unfinished work as an npm package.
>
> ⚠️ `git add -A` in a shared tree commits everything — including the other session's files.
>
> ⚠️ A sub-agent says "I'll wait for the background task" and never wakes up. The work lies finished in the
> tree. No error, no report.
>
> What helped: push bans for implementation agents, explicit paths only, worktrees, and measuring liveness on
> the process — not on the last message.
>
> Part 7:
>
> 👉 [link]
>
> #aiagents #devops #git #monorepo #softwareengineering

---

## Part 8 — The agent that pleases

**Content:** Four failure classes with real incidents. (1) The accommodating agent: removed test case, known
defect encoded as green, "known defects are always red", nobody re-reads a red test. (2) Absences: four features
built and unreachable in one night, 23 translation keys checked but never rendered, owner walkthrough misses a
route permission, test kernel with fewer plugins, three-case gate tests. (3) The lying instrument: 250-entry
buffer, success message stating intent, mock swallowing bulk inserts, table engine logging instead of failing,
75 of 137 test files gone with a green type check; "what would be different without this construct?" (4) Invented
evidence: line reference beyond file length, timestamps in the future, paraphrase hardening into a rule, a decision
without its wording.

### LinkedIn post (Part 8)

> Our request counter reported **0**.
>
> The page was firing about **150 request batches per second**.
>
> The browser's performance buffer holds 250 entries, and in dev mode it was full of module loads before the
> first API call ran. Not "no requests" — a blind instrument that looks exactly like a passed check.
>
> That is one of four failure classes I keep seeing when an AI agent verifies its own work:
>
> 🙂 **The agent pleases.** It encoded a known defect as the expected result. Suite: 12/12 green, reporting
> all clear while knowing the opposite.
>
> 🕳️ **Absences.** A feature with logic, frontend code, 23 translation keys and green tests — rendered by no
> component. No tool reports what is missing.
>
> 📏 **The instrument lies.** A guard whose success message described what it *intended* to check, not what
> it compared. One hour lost chasing a state that did not exist.
>
> 📎 **Invented evidence.** A plan cited lines 1543–1546 of a file with 1,016 lines.
>
> The question that would have caught all of these: *what would be different if this construct did not exist
> at all?*
>
> Part 8, the longest one:
>
> 👉 [link]
>
> #aiagents #softwaretesting #qualityassurance #llm #softwareengineering

---

## Part 9 — Rules need exit codes, and green is not useful

**Content:** `--no-verify` five times despite explicit prohibitions; prohibitions must name the effect; the
PreToolUse hook that denies bypasses. Eight red CI runs unnoticed; the push gate. "Red is the finding." Built
correctly and pointless: competitor-driven plans, the mandatory user-job section, done = played through as the
persona, the sense check. What I would do again and what not. Closing with the ten sentences.

### LinkedIn post (Part 9)

> Every task brief said: never use `--no-verify`.
>
> On one day, three AI agents committed with `--no-verify` anyway — and reported it themselves as a "reflex".
> A sharper wording helped for nine days. Then a fifth agent bypassed the hook with a different flag.
>
> Two lessons:
>
> 1️⃣ A prohibition must name the **effect**, not the spelling. Name one flag and you get the next one.
>
> 2️⃣ What must hold needs an **exit code**. A hook now inspects every shell command the agent wants to run
> and denies any push that bypasses the test chain. Red is the finding: report it, don't bypass it.
>
> The other lesson from the last part of this series is less technical. After one test round, my verdict on
> many features was: implemented correctly — and pointless. Clean data models, a UI glued on, no workflow a
> real user could play through.
>
> Since then, every plan names a **user job**, and "done" means that job was played through in the browser as
> that persona.
>
> Built correctly is not the same as useful.
>
> Final part, with what I would do again and what I would not:
>
> 👉 [link]
>
> #aiagents #softwareengineering #productmanagement #devops #claudecode

---

## Open points before publishing

1. **Knowledge base attribution.** The knowledge base README in the SaaS repo references Andrej Karpathy's
   LLM-wiki model; the briefing mentioned Boris Cherny. The report currently names neither — decide which
   attribution (and link) is correct before part 4 goes out.
2. **Anonymisation.** The report names the product categories of the SaaS platform, not customers, colleagues
   or client systems. The client-project service stays anonymised as in the original field report.
3. **Numbers** were measured on 2026-09-17 and will drift — re-measure (or keep the date) at publication time.
4. **The two German drafts from 2026-09-16** need translation before they can be linked.
5. **Nanook placement.** Parts 1–4 barely mention Nanook, which matches the tone rule; parts 5, 6 and 8 carry
   the product naturally. Check whether the CTA at the end of each post should point to the quickstart.
