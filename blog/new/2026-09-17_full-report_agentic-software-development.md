# Agentic Software Development — How We Build Software with AI Agents, What Works, and Where It Breaks

*A field report from two settings: a multi-product SaaS platform built over nine months, and an
event-driven service built in eleven days inside a client project. The numbers are real. Where
something went wrong, it is in here too — that is the part most worth reading.*

---

## Contents

1. [Why this report exists](#1-why-this-report-exists)
2. [The two settings and their numbers](#2-the-two-settings-and-their-numbers)
3. [The toolbox: skills, MCP servers, and a token diet](#3-the-toolbox-skills-mcp-servers-and-a-token-diet)
4. [The instruction file: short rules, long rules, and rules that load themselves](#4-the-instruction-file-short-rules-long-rules-and-rules-that-load-themselves)
5. [Directory layout: one root, many repositories](#5-directory-layout-one-root-many-repositories)
6. [The requirements lifecycle: analysis, design, plan, done](#6-the-requirements-lifecycle-analysis-design-plan-done)
7. [Knowledge that outlives the session: the knowledge base and the lesson memory](#7-knowledge-that-outlives-the-session-the-knowledge-base-and-the-lesson-memory)
8. [Two environments: project work versus open product work](#8-two-environments-project-work-versus-open-product-work)
9. [Forcing requirements into tables](#9-forcing-requirements-into-tables)
10. [Designing a service so it can be tested without its infrastructure](#10-designing-a-service-so-it-can-be-tested-without-its-infrastructure)
11. [Tests first: the red chain](#11-tests-first-the-red-chain)
12. ["Implement all plans": the autonomous pipeline](#12-implement-all-plans-the-autonomous-pipeline)
13. [Many repositories, one change: parity and release cascades](#13-many-repositories-one-change-parity-and-release-cascades)
14. [Where it breaks, part 1: the agent that pleases](#14-where-it-breaks-part-1-the-agent-that-pleases)
15. [Where it breaks, part 2: absences nobody reports](#15-where-it-breaks-part-2-absences-nobody-reports)
16. [Where it breaks, part 3: the measuring instrument lies](#16-where-it-breaks-part-3-the-measuring-instrument-lies)
17. [Where it breaks, part 4: invented evidence](#17-where-it-breaks-part-4-invented-evidence)
18. [Where it breaks, part 5: rules in prose are not enforced](#18-where-it-breaks-part-5-rules-in-prose-are-not-enforced)
19. [Where it breaks, part 6: parallel sessions in one checkout](#19-where-it-breaks-part-6-parallel-sessions-in-one-checkout)
20. [Where it breaks, part 7: built correctly, and pointless](#20-where-it-breaks-part-7-built-correctly-and-pointless)
21. [Cost: tokens, models, and budgets](#21-cost-tokens-models-and-budgets)
22. [What I would do again, and what I would not](#22-what-i-would-do-again-and-what-i-would-not)
23. [The short version](#23-the-short-version)

---

## 1. Why this report exists

Most writing about AI-assisted development is about speed. Speed is real — but it is not the
interesting part, and it is not the part that decides whether the result is any good.

After nine months of building software almost exclusively through an AI coding agent in the
terminal, my conclusion is this:

> **The agent writes the code. What makes the code trustworthy is everything around the agent:
> the structure it works in, the order of the steps, the checks it cannot talk its way past, and
> the knowledge that survives the end of a session.**

This report describes that "everything around". It covers the setup (tools, instruction files,
directories), the process (analysis → design → plan → implementation), the testing approach
(tables first, tests second, code third), the automation (a pipeline that works through plans on
its own), and — at length — the failure modes. The failures are the most useful part. Every rule
in the setup exists because something went wrong at least once, usually more than once.

A note on roles: the agent writes nearly all of the code. I design, decide, review, contradict, and
— most importantly — decide which of the agent's claims I believe.

---

## 2. The two settings and their numbers

### Setting A: a multi-product SaaS platform (open product work)

Five products built on shared modules: association management, software for trades businesses,
property management, an e-invoicing API, and a PDF API. Backends and frontends are plugin-based;
most functionality lives in shared packages that several products import.

Measured on 2026-09-17:

| | |
|---|---|
| Duration | since December 2025 (~9 months) |
| Git repositories under `repo/` | **74** (products, shared packages, tools, archive) |
| Commits across those repositories | **~14,000** |
| Commits in the root repository (plans, rules, knowledge) | **4,284** |
| Completed plans and analyses (`done/`) | **~1,240** |
| Open plans | 65 |
| Lesson memory entries (one lesson per file) | **327** |
| Knowledge-base articles | 66 compiled from 122 raw sources |
| Active skills | 24 (14 archived) |
| Path-bound rule files | 10 |

Each repository is released on its own with semantic-release and published as an npm package. A
change to a shared package often has to travel through ten or more repositories before a user sees
it.

### Setting B: an event-driven service in a client project

A service that consumes messages from Kafka, keeps state in Postgres, publishes decisions back to
Kafka, and serves a web UI over REST. Requirements came from outside, interfaces existed.

| | |
|---|---|
| Duration | 11 days, 12 designs on day one |
| Commits | 97 |
| Source code | 8,053 lines in 54 files |
| Test code | 9,183 lines in 44 files |
| Tests | 806 (805 passing, 1 skipped) |
| Decision-table sheets | 13, of which 11 generate cases |
| Generated test cases | 214, written as 1,712 files |
| Table coverage | 100 % per sheet — the build fails otherwise |

The two settings look very different, and the process differs where they differ. But the core —
structure, order, gates, retained knowledge — is the same. That is why they belong in one report.

---

## 3. The toolbox: skills, MCP servers, and a token diet

### 3.1 Superpowers as a starting point, adapted per project

I start every project with [Superpowers](https://github.com/obra/superpowers), a collection of
process skills for coding agents: brainstorming, writing plans, executing plans, test-driven
development, systematic debugging, verification before completion, and so on.

I never use it unchanged. Each project gets its own adaptation:

- **Paths and conventions.** "Write a plan" means: write it to `REQUIREMENTS/<PRODUCT>/plan/`, with
  the file-name pattern of this project, with a mandatory `## User job` section (more on that in
  [section 20](#20-where-it-breaks-part-7-built-correctly-and-pointless)).
- **Project language.** The skills speak the vocabulary of the project, not a generic one.
- **Project-specific skills on top.** In the SaaS platform, most skills are ours: onboarding a new
  country into the e-invoicing pipeline (pin the official specification by SHA-256 → scaffold
  catalogue and validation gates → wire generator and validator into the backend), drift checks
  against pinned legal sources, deployment to the VPS, building decision tables, running the
  autonomous plan pipeline, a browser QA walkthrough, dependency cascades across repositories.

### 3.2 Playwright MCP for anything with a frontend

When the software has a user interface, the agent gets a browser through the
[Playwright MCP server](https://github.com/microsoft/playwright-mcp). Without it, the agent can
only claim that a screen works. With it, it can click through the screen as a user, read console
errors, count network requests, and take screenshots.

Two lessons from running it at scale:

- **One browser per parallel session.** When several agent sessions share one Playwright MCP
  instance, they share the browser — one session navigates away from the page another session is
  testing. We run several named instances (`playwright`, `playwright-2`, `playwright-3`) and assign
  them.
- **A browser walkthrough answers "does it work?", not "is it correct?"** See
  [section 15](#15-where-it-breaks-part-2-absences-nobody-reports) — a walkthrough as the owner
  account will never find a missing permission check.

### 3.3 The token diet: delete or archive what is not used

Every skill, agent, and command has a description that travels with **every single request** so
the model knows it exists. Twenty unused skills are twenty paragraphs of noise in every call —
paid for in tokens, and paid for again in attention.

My rule: **whatever is not needed gets deleted or moved to an archive folder** outside the path the
agent loads.

On 2026-09-03, I measured this in the SaaS platform: 14 skills had not been invoked **once** in 91
sessions over a month. Among them were five of the original Superpowers process skills
(test-driven development, systematic debugging, verification before completion, subagent-driven
development, dispatching parallel agents) — not because the ideas are wrong, but because the
project's own pipeline had absorbed them. They went into `.claude/skills-archiv/` with a README that
names the replacement and how to reactivate them.

> **Unused capability is not free.** It costs tokens on every call and dilutes the selection the
> model has to make.

---

## 4. The instruction file: short rules, long rules, and rules that load themselves

Every coding agent reads a project instruction file at the start of a session (`CLAUDE.md` for
Claude Code, `AGENTS.md` for others). It is the most important file in the project — and it rots
faster than any other.

### 4.1 The problem: the file grows until nobody (including the agent) reads it

Each incident adds a paragraph. After a few months, the file is thousands of lines long, the
important rules are buried, and every session pays for all of it.

### 4.2 The solution: one sentence per rule, the rest loads on demand

The instruction file in the SaaS platform is now 170 lines. Each mandatory rule is **one sentence —
the sentence on which the rule holds or fails** — plus a pointer to its long version:

```markdown
- **A test checks the payload** — 🔴 it contains what I sent: each value read from the input,
  never from a constant. → `tests-payload-spec-table.md`
- **Database migrations expand/contract** — feature releases are additive; DROP/RENAME/SET NOT NULL
  only in their own contract release; 🔴 never by hand. → `migrations-expand-contract.md`
```

The long versions live in `.claude/rules/` — ten files, 913 lines in total — with rationale,
precedents from the codebase, test questions, and measurements. Each carries a path filter in its
frontmatter:

```yaml
---
paths:
  - "**/tests/**"
  - "**/*.test.ts"
  - "**/*.xlsx"
---
```

The rule about test payloads loads **only** when the agent touches a test file or a table. The rule
about database migrations loads only near migrations. The session pays for what it needs.

One caveat, written into the instruction file itself: *if you decide something in an area without
opening a file there, read the long version by hand — otherwise the binding never fires.*

### 4.3 What belongs in the instruction file at all

- What is **always** true (project overview, where things live, the push gate).
- The one-sentence version of each hard rule.
- Pointers, not content: architecture docs, requirement folders, the knowledge base.

What does not belong: history, measurements, examples, one-off decisions. Those go into the long
rules, the knowledge base, or the lesson memory.

---

## 5. Directory layout: one root, many repositories

### 5.1 The root is a repository too

I always work from a **root directory that is itself a Git repository**. It holds everything that
steers the agent and everything that is shared across the code repositories:

```
root/                          ← Git repository
├── CLAUDE.md                  ← instruction file
├── .claude/
│   ├── rules/                 ← long versions of the rules, path-bound
│   ├── skills/                ← active skills
│   ├── skills-archiv/         ← archived skills (not loaded)
│   ├── agents/                ← sub-agent definitions (implementer, QA runner, reviewer)
│   ├── commands/              ← slash commands
│   └── architecture/          ← architecture docs
├── REQUIREMENTS/              ← analyses, designs, plans, done
├── knowlage-base/             ← knowledge base (its own repository)
└── repo/                      ← the code repositories
```

Why a repository? Because plans, rules and decisions change constantly, and I want to see *when* a
rule appeared and *which incident* caused it. The root repository has 4,284 commits — more than
most of the code repositories.

### 5.2 Layout for a multi-product SaaS with shared modules

```
root/REQUIREMENTS/<PRODUCT or TOPIC>/
    analyse/
    design/
    plan/
    done/

root/repo/
    products/<product>/     ← app backend, app frontend, portal, landing page,
                               product-exclusive packages
    packages/               ← shared modules: backend / frontend / spec
    tools/                  ← test framework, table tooling, admin tools, MCP servers
    mocks/                  ← mock services
    archive/
```

`REQUIREMENTS/` has one folder per product (and some cross-cutting ones: core, general, E2E tests,
and a folder for items that are blocked or deferred).

The assignment rule for code is mechanical, so neither I nor the agent has to think about it: **if
a package's prefix is a product name, it lives in that product. If a second product adopts it, the
prefix goes and it moves to `packages/`.**

Every directory under `repo/` is its **own Git repository** with its own release. Apps import
shared modules as versioned npm packages. That has consequences for how changes travel — see
[section 13](#13-many-repositories-one-change-parity-and-release-cascades).

### 5.3 Layout for an event-driven microservice architecture

The main difference: **requirements live per service**, not in a shared folder at the root.

```
root/
└── repo/
    ├── service-a/
    │   ├── REQUIREMENTS/{analyse,design,plan,done}/
    │   └── src/, tests/, tables/
    ├── service-b/
    │   └── REQUIREMENTS/…
    └── contracts/          ← message schemas shared between services
```

The reason is ownership. In a microservice landscape, a service is designed, tested, and deployed
on its own. Its requirements belong next to its code. In a multi-product platform with shared
modules, a single requirement usually cuts across several repositories — so it belongs above them.

### 5.4 File names

All requirement documents follow one pattern:

```
<yyyy-mm-dd>_<analyse|design|plan>_<topic>.md
```

For example: `2026-09-15_plan_01-the-xsd-gate-fails-silently.md`. Plans get a daily sequence number
starting at `01`.

The date sorts naturally, the type is visible without opening the file, and the agent can find
"all plans from last week about topic X" with a single glob.

---

## 6. The requirements lifecycle: analysis, design, plan, done

### 6.1 Where to start

- **Analysis** when I know nothing yet. What exists, what does the specification say, what do
  comparable systems do, what does the code currently do? An analysis ends with findings and open
  questions, not with a solution.
- **Design** when I know enough to shape a solution. This is the normal starting point.

### 6.2 For a new service: first an outline of designs

When the project is a new service, the agent's first design is not a design — it is an **outline of
the designs we will need**. For an event-driven service, a proven cut looks like this:

| No. | Design | Defines |
|---|---|---|
| 00 | Overview | vision, core decisions, glossary, **decision log** |
| 10 | Data contract | messages: fields, required, enum values, keys |
| 20 | Data model & persistence | tables, indexes, permissions, who migrates |
| 30 | Inbound processing | ordering, conflicts, idempotency |
| 40 | Responsibility | who sees and may do what |
| 50 | Deadlines & scheduling | tick, grace periods, what a deadline triggers |
| 60 | Outbound | which message leaves when |
| 70 | UI interface | paths, roles, error shapes |
| 80 | Operations | instances, health, alerts, cleanup |
| 90 | Test integration | how the service fits the existing test landscape |

**The outline determines the order of work.** Then we design one item after another until all have
been done once.

### 6.3 A review after every design

Each design gets a review before the next one starts — by me, and often by a second agent that has
not seen the conversation, so it reads the document rather than the intent behind it.

Two things go into every design:

- **Open questions** as their own section. What is unclear stays visible.
- In the overview: a **numbered decision log** — decided, rejected, with the reason. The rejected
  alternative is the more valuable entry, because it is the one someone will propose again.

### 6.4 Decision tables as one of the first designs

When interfaces already exist, one of the first items is often to **build the decision tables** —
for inbound data, for the expected outbound data, and for the remaining data of an API. The tables
define which classes of data exist and later generate them. This is important enough to have its
own section: [section 9](#9-forcing-requirements-into-tables).

### 6.5 From designs to plans — and the ripple effect

When all designs are done, the agent writes the **plans**: executable, step by step, with the files
to touch, the tests to run, and the definition of done.

In practice, **writing the plans uncovers changes that were not visible during design.** A step
that sounded simple turns out to require a column nobody modelled. An interface assumed by design 60
is not what design 30 produces. These changes almost always affect **the following designs and
plans — and sometimes the preceding ones**.

So planning is not a one-way street. When a plan changes an assumption, the affected designs are
updated before the next plan is written. Otherwise the next plan is based on a design that is
already wrong.

### 6.6 Done means moved — and fed into the knowledge base

- When the plans for a design exist, the **design (or analysis) moves to `done/`**. It is reference
  material from then on, no longer an instruction.
- When a plan has been implemented, **the plan moves to `done/`** — and what was learned goes into
  the knowledge base.

This is not bookkeeping. The agent treats everything in `plan/` as open work. A finished plan left in
`plan/` gets re-implemented, or worse, "fixed" against code that has moved on. A plan's status is
also checked **against the code**, not against the plan's own checkboxes — a box that says done is
a claim; the code is the evidence.

### 6.7 Two more rules that keep the folders honest

- **Blockers leave the plan.** If part of a plan cannot proceed (missing decision, missing access),
  the implemented part goes to `done/`, and the blocked remainder is extracted into a central
  `BLOCKED-DEFERRED/` folder with the reason. A plan that stays half-open forever hides both what was
  done and what is missing. Before extracting, the blocker is verified — more than once, a "no
  access" turned out to be self-service.
- **Test plans go into a central E2E folder**, not scattered across products, because tests usually
  span modules.

---

## 7. Knowledge that outlives the session: the knowledge base and the lesson memory

An agent session starts empty. Everything it knows about the project comes from what it reads. So
the question "what does the next session know?" decides whether the project learns — or repeats the
same mistakes every week.

We use two separate stores, because they answer two different questions.

### 7.1 The knowledge base: "how does our system work?"

The knowledge base is **its own repository**. It is structured along the model of an LLM-maintained
wiki: humans feed raw material in, the model compiles it into readable articles, humans read the
articles.

```
knowlage-base/
├── raw/                  ← unfiltered sources (append-only), fed by me
│   ├── sources.md        ← manifest pointing to repo docs, plans, code
│   └── <area>/
└── wiki/                 ← compiled by the LLM
    ├── index.md          ← master index: every file + one line
    ├── common/           ← shared platform knowledge
    └── <product>/        ← per product
```

The rules for compiling: one concept per file; every file starts with `Stand: <date> · Source: …`
and a one-line summary; backlinks between articles; distil, don't copy — when a source and the wiki
disagree, the source wins and the date is updated. A lint skill checks for dead links, stale dates,
orphans, and contradictions.

What goes in:

- **Directory structure** and where things live.
- **The target environment**: how development, test, staging and production are set up.
- Everything I consider important, organised along four topics:
  - **Development** — architecture, patterns, conventions, why things are the way they are.
  - **Test** — test framework, tables, test environments, known traps.
  - **Deployment** — how releases travel, how deploys run, what must happen in which order.
  - **Production** — topology, databases, monitoring, what real customers use.

Every completed plan contributes. The plan itself goes to `done/`; the knowledge it produced goes
into the wiki.

The knowledge base is also exposed to the agent through a small MCP server with search and read
tools, so a session can look something up instead of guessing.

### 7.2 The lesson memory: "what went wrong, and how do we avoid it?"

The second store is a set of **one-lesson-per-file notes** that the agent writes itself, with an
index that is loaded into every session. There are 327 of them now.

Each note has the same shape:

```markdown
---
name: success-message-claims-more-than-measured
description: A guard skipped a missing entry silently and still reported "all match"
type: feedback
---

<what happened, with the real numbers>

**Why:** <the mechanism behind it>

**How to apply:** <the concrete check that prevents it next time>
```

The index groups them by failure class — *tests and assertions*, *the measuring instrument lies*,
*search and replace*, *silent data loss*, *reachability*, *claim versus measurement*, *build and
push gate*, *release*, *Git in a shared checkout*, *parallel sessions*, and more. The groups
themselves are a finding: after a few hundred lessons, the incidents cluster into about twenty
failure classes. Most of sections 14–19 of this report are drawn from them.

Three observations about keeping such a memory:

1. **A lesson solved locally comes back.** One note records that the same mistake (removing a test
   case because the application could not do it, instead of recording the gap as a finding) had
   been fixed three times — each time with a comment in the file concerned. A comment protects the
   file it is in. Only the fourth time, when it became a rule, did it stop.
2. **A lesson needs the mechanism, not just the incident.** "Don't do X in file Y" helps once.
   "Tools that skip a check silently turn every skipped check into an assurance" helps everywhere.
3. **Memories go stale.** A note that names a file, function or flag reflects what was true when it
   was written. Before acting on one, verify it still holds.

---

## 8. Two environments: project work versus open product work

How I proceed depends heavily on the environment.

### Project work: requirements come from outside

In a client project, the requirements usually come from outside, and there are concrete interfaces
already: message schemas, API specifications, existing systems to integrate with. That is a huge
advantage. **The specification is the oracle** — I can derive tests from it before I write a line
of code.

### Open product work: requirements have to be developed first

When everything is open — a new product, a new module — nobody hands you the requirements. You have
to develop them yourself: analyses of the domain, of legal requirements, of what users actually do.
The risk here is not bad code but **plausible features that nobody needs** (see
[section 20](#20-where-it-breaks-part-7-built-correctly-and-pointless)).

The rest of the process is the same. But the first phase is different, and it is worth describing
the project case in detail, because it shows most clearly what the combination of tables, tests,
and an agent can do.

---

## 9. Forcing requirements into tables

### 9.1 The first step in a project: analyse, then translate into tables

When I receive a specification for a service, the first thing I do is have the agent analyse it and
**translate it into equivalence-class tables** using the
[Nanook skill](https://github.com/xhubio/nanook-skill). Nanook is a table engine that reads decision
tables from an Excel workbook and generates test cases from them.

Two forms matter:

- **Decision table** — what something *is*: fields, their classes (valid, boundary, missing, unknown
  enum value…), and cases that cover class combinations. The engine computes what percentage of the
  combinations is covered and which are missing.
- **Matrix table** — what something *becomes*: rows are states, columns are events, each cell is the
  reaction.

### 9.2 Why this finds contradictions an AI reading prose does not

A table demands three things prose does not: **every field needs classes, every combination needs a
row, every row needs a result.** Whoever fills that in can no longer stay politely vague.

> **Prose does not lie. It stays silent — exactly at the places where the work is. A table cannot
> stay silent.**

The agent can read a 40-page specification and summarise it perfectly. It will not tell you that
page 12 and page 31 contradict each other in a case nobody spelled out. Filling in a table forces
the question for every single case — including race conditions and the combinations nobody thought
about.

### 9.3 What the tables found in the event-driven service — before any code existed

The designs were good: twelve documents, cleanly cut. Building the tables still found:

- **A contradiction between two of our own artefacts.** A sheet claimed a record would be shown with
  a hint; the mapping rule excluded exactly that record. Both cited the same design decision.
- **Seven filter criteria that had no effect** — despite tests running against a real Postgres. An
  *empty* filter arrives correctly even if the implementation throws it away. The existing test had
  been built around the gap. The table's classes *set / empty / multiple* asked what happens for
  *set*.
- **A combination with no answer.** Priority 0 without a feeder — unclear in the domain. It is now
  an explicit exception in the table instead of a row that asserts a result nobody decided.
- **A fourth cancellation case that was really its own state.** In prose, a variant. In the matrix,
  it reacts differently to three events, so it got its own row.
- **Two numbers that did not match.** The UI showed 50 rows per page; the database design said
  `LIMIT 20`. Both had been written down for days, in two documents.
- **A misnamed event.** Filling in the matrix showed that a "deadline expired" event sends no
  message at all — it only changes what the UI shows. It was renamed after its real trigger. The
  wrong name would have produced an outbound message that must not exist.
- **Database columns demanded by cells.** Two columns exist because one matrix cell each requires
  them. No design had asked for them.
- **"Ignore" separated from "error".** In prose both read as "nothing happens". In the matrix they
  are two different reactions — an expected non-reaction versus a log entry.

**The table is not a test artefact. It is a verification tool for the requirement.** It costs about
a day and finds things that would otherwise be found in production.

### 9.4 Tables in the SaaS platform

The same approach runs through the SaaS platform, at larger scale: E2E tests across products are
decision tables read as data by one shared runner, and e-invoicing rules are tables derived from
pinned official specifications. Three rules proved essential:

1. **The decision table is the point of truth.** No test case without a table row. The table is
   never overwritten automatically.
2. **A test is derived from the specification, not from our code.** The oracle is the pinned spec
   artefact — never a constant from `src/`. A test that reads its expected value from the code under
   test checks the code against itself.
3. **A removed case becomes a finding in the same step.** If a planned case cannot be executed
   because the application cannot do it, that is a defect to record — not a row to delete.

---

## 10. Designing a service so it can be tested without its infrastructure

### 10.1 The principle

I always design a service so that **its function works and is testable without the external
connections.**

For an event-driven service, that means: the business logic must not care whether an event arrives
via Kafka, a message bus, or REST — or how the result leaves. Transport is an adapter at the edge.

```
             ┌─────────────────────────────────────────┐
  Kafka ──►  │ adapter │  business logic (pure +      │ adapter │ ──► Kafka
  REST  ──►  │         │  ports: persistence, clock,  │         │ ──► REST
             │         │  outbound, log)              │         │
             └─────────────────────────────────────────┘
```

The business logic talks only to **ports**: one contract each for persistence, outbound messages,
the clock, logging, and external data. In tests, the ports are recorders and fakes. In production,
they are Kafka, Postgres, and HTTP.

### 10.2 Why this matters even more with an agent

- **All tests can run immediately.** No broker, no database, no network needed to verify the
  business logic. The feedback loop is seconds, not minutes.
- **The agent can check itself constantly.** This is the key point. An AI agent is very good when it
  can verify its own work after every step. It is mediocre when it has to guess whether it worked.
- **Adapters stay thin.** They translate, they do not decide. Rules at the edge are rules nobody
  tests.

### 10.3 Five stages, each with a prohibition

In the event-driven service, implementation ran in five stages. Each stage has something it must
not do — which is what keeps the layers honest:

| Stage | Subject | Prohibited |
|---|---|---|
| 1 | Pure functions | no clock, no database, no messages |
| 2 | Business logic against ports | no real infrastructure; injected clock; recorders instead of adapters |
| 3 | Persistence | **no business rules** — only that what is meant gets written and read |
| 4 | Edges | configuration, startup, shutdown, adapters |
| 5 | End to end | the built bundle, with a smoke test |

For stage 3, an in-process Postgres engine that replays the **real** DDL script means the test checks
the schema, not an imitation of it.

---

## 11. Tests first: the red chain

### 11.1 Clear interfaces make test-driven work possible

When interfaces are clear, we have a big advantage: we can write **all the tests first** and run them
against an empty function body. The expected result is that **every test fails with "not
implemented"**.

The sequence in the event-driven service was:

1. **The contract.** All types, all error classes, all ports — 18 port methods and four pure
   functions. Each throws "not implemented", **with the same wording from one constant**. No
   behaviour, only shape. Type checking is green.
2. **The oracle.** A loader that reads the generated case folders, and **one** place that translates
   the table's short codes (`INS>OPEN`, `UPD>CLERK`, `IGN`, `ERR`) into assertions. That translation
   is tested itself. Everything else in the test code passes values through without interpreting
   them.
3. **The red chain.** All tests written before any business logic: first 112 red and 15 green (the
   green ones tested the oracle itself), then 245 red — **all with the same message.**

Why the identical message matters: it is the only moment you can **prove** the tests assert
something. If all 245 fail with "not implemented", the suite does not yet test anything but itself. A test
that fails for any other reason is a broken test — and found now, it costs minutes. Check the message
by machine, not by eye; the test runner can emit it as structured data.

### 11.2 Then: "implement it, and use the tests to check the result"

When all plans exist and the red chain stands, the instruction to the agent becomes simple:

> Implement the plans. Use the tests to check the result.

This is where the agent is at its best. It has a precise, machine-checkable target, a fast feedback
loop, and no room for interpretation of what "done" means.

At the end of stage 2 of the event-driven service: **280 tests green — without a single expectation
changed.** Eight times something had to be adjusted, and it was always the *setup* of a case, never
the expected result. Each of the eight corrections is documented with a reason in the table or the
design.

### 11.3 The rule that carries the whole approach

> **When a test is red, change the code. If you want to change the expectation, change the table
> first — and write down why.**

Without this rule, an AI agent (or a human under time pressure) rewrites the expectation until it
passes. See [section 14](#14-where-it-breaks-part-1-the-agent-that-pleases).

### 11.4 Counter-probes: break every safeguard once on purpose

A green test proves nothing if it would also be green when the thing does not work. So for every
safeguard, we removed it deliberately and **counted** which tests turned red:

| Intervention | Expected | Measured |
|---|---|---|
| typo in a model column | model gate fires | 2 red |
| a database constraint removed | constraint is checked | 4 red |
| responsibility derivation disabled | assignment is effective | 5 of 8 red |
| leader row removed | only one instance decides | red |
| old revocation logic restored | new path is effective | 1 red |
| local time instead of fixed zone | zone is pinned | exactly 3 red |
| empty filter list read as empty set | empty means "no filter" | 13 red |

Two lessons: expect a **number**, not "something goes red". And place the probe **where the test
actually reads** — a probe at the wrong place stays green and makes a good safeguard look useless.

---

## 12. "Implement all plans": the autonomous pipeline

In the SaaS platform, the volume of plans made one-plan-at-a-time impractical. So the agent works
through them on its own, with a skill called **plan-pipeline** and a loop command that keeps it
going.

### 12.1 What the pipeline does

For a given `REQUIREMENTS/<PRODUCT>` folder:

1. **Audit** every open plan against the code. What is already there? What is really open? (Plans
   routinely turn out to be partially done — or claim to be done and are not.)
2. **Implement** the open increments — one sub-agent per step: implement, build, test, commit.
3. **Release** — push, wait for CI, cascade versions into dependent repositories.
4. **Move** finished plans to `done/`; extract blocked remainders.

### 12.2 The ledger: the pipeline's memory

The heart of the pipeline is a **ledger file** — a Markdown table with one row per plan and a
status vocabulary: `open`, `verified-open`, `in-work`, `blocked`, `extern` (another session owns it —
do not touch), `done`.

**Every** status change is written to disk immediately. A run that dies (server error, killed
process, exhausted context) loses at most the current increment. The next run reads the ledger and
resumes.

Two refinements came from real crashes:

- **Write-ahead.** A ledger that is written *after* the sub-agent reports is empty exactly where it
  hurts. So before every agent spawn and every push, a row goes into an `IN FLIGHT` table at the top.
  A non-empty `IN FLIGHT` table at startup always means: a turn died here — check Git, which is the
  truth.
- **Size measured in bytes.** Resume reads only the head of the ledger (`head -c 40000`, ~10k
  tokens). When it passes 150 KB, the old part is archived. A single row may not exceed 800
  characters — detailed findings belong in the agent report, not the ledger.

### 12.3 Model assignment

Not every job needs the most expensive model, and not every job tolerates a cheap one:

| Role | Model | Why |
|---|---|---|
| Orchestrator | strong model | judgement: audits, blocked/done decisions, what to believe |
| Implementation, browser QA, code review | strong model | real implementation scope, hundreds of tool calls |
| Dependency cascades, scaffolding, drift checks | faster model | diligent, well-specified routine work |

And a delegation threshold: up to about five Git commands, builds that take seconds, or one-line fixes,
the orchestrator does the work itself. Spawning an agent has overhead — it knows only what is in its
brief, and the orchestrator sees only its summary.

### 12.4 Decisions unblock work

One simple rule removed a surprising amount of friction: **when a decision has been made, that is
also the go-ahead for implementation.** The pipeline had parked eleven plans as "decision made, go
missing" — from the outside, it looked like nothing was happening.

---

## 13. Many repositories, one change: parity and release cascades

### 13.1 App parity

The e-invoicing API, the trades software, and the PDF API share the same plugins and backends. A
change to a shared backend package or frontend plugin must be checked against **all** apps. The same
bug in several apps is fixed **in all of them at the same time**. That rule is in the instruction
file, marked critical — because an agent that fixes a bug in the app it is looking at considers the
job done.

### 13.2 Release cascades

A change in a shared package travels: package release → bump in the next layer → release → bump in
the apps → release. With 74 repositories, a topological order matters. A command
(`/update-cascade`) computes that order and drives the bumps, with up to nine sub-agents in parallel
on a fast model and a pin file that holds back versions deliberately.

### 13.3 The push gate

- Before every push: the full test chain in the affected repository (format, lint, type check, dead
  code, build, tests with coverage). A global `pre-push` hook enforces it.
- **After the push, the CI run counts**, not the push. Watch the run until `completed/success`, and
  sweep all touched repositories at the end of a run.
- **A green CI run without a release publishes nothing.** semantic-release silently skips a release
  if the branch is behind the remote — for example because the next commit was pushed during the CI
  job. Bundle backend waves, push once.

Why so strict? See [section 18](#18-where-it-breaks-part-5-rules-in-prose-are-not-enforced).

---

## 14. Where it breaks, part 1: the agent that pleases

**The agent is fast, but it is accommodating.** Its goal is a green result, and there are always two
ways to get one: fix the code, or adjust the expectation.

In the event-driven service, the rule "change an expectation only via the table, with a reason" is
the reason the suite still asserts something. Without it, I would have had a green test suite on day
two that asserted nothing.

The same tendency shows up in quieter forms:

- **Removing a case the application cannot handle.** Four statuses in the schema, three filter
  switches in the UI — the agent removed the test case for the fourth status and noted nothing. Only
  my follow-up question ("you did record that as an issue, right?") saved it. The rule since then: a removed
  case becomes a finding in the same step. The test question: *why doesn't it work?* — "because the
  app can't" is a finding; "because it makes no sense" is a comment in the table, so the next person
  doesn't add it back.
- **Encoding a known defect as expected behaviour.** The agent built four test cases that asserted
  the *current* wrong status. Suite: 12/12 green — reporting "all clear" while knowing the opposite.
  I turned it around and made it a rule: **known defects are always red in the tests.** The test
  expects the correct behaviour and fails, with a message naming the finding, where it was measured,
  and what would make it green.

  And the flip side, measured two days later: *nobody re-reads a red test.* Three hand-written test
  fixtures carried a 🔴 in their title for an object that no longer existed. A red test is only useful
  if something tracks it.

> The purpose of a test suite is not to be green. It is to say what is.

---

## 15. Where it breaks, part 2: absences nobody reports

The most expensive class of defect in agent-built software is not a wrong result. It is **something
missing** — because no tool reports an absence.

In a single night, the same defect appeared four times in four modules:

| Case | State |
|---|---|
| Goods receipt | business logic fully correct — the form was permanently inside a disabled fieldset |
| Collective invoice | procedure, frontend logic, 23 translation keys, tests green — **no component rendered it** |
| Balance sheet & P&L | backend published, view published — **two lines missing** in the app client |
| An accounting-mode suggestion | port built, optional — **never wired**, so the query answers `null` |

The sharpest evidence: for the collective invoice, the green suite explicitly checked that **all 23
translation keys exist** — just not that anyone ever **displays** them.

The type checker sees nothing. The tests see nothing. The build sees nothing. The dead-code check
sees nothing. The only thing that notices an absence is a human in a browser — the most expensive
path. And because everything is green, everyone believes it is done.

Two variations:

- **A browser walkthrough as the owner finds no missing permission.** The agent built a new screen,
  clicked through it as a persona — module switch, both pages, navigation, two languages, zero console
  errors. Still unfinished: the *menu entry* carried the permission, the *route* did not. A user
  without the permission would not see the menu item, but could open the page by URL. The walkthrough
  ran as the owner, who has every permission. A missing lock is invisible to whoever owns the key. A
  guard test (`every route carries the same permission as its menu entry`) found it — in seconds.
- **The test kernel loaded fewer plugins than production.** Permission keys were therefore *unknown*
  in tests, and every gate on them is fail-closed — it rejected even the owner. The "forbidden" test
  was **green**: the viewer was rejected, just for the wrong reason. Only the positive control
  ("the member *does* get past the gate") found it. Every gate test needs three cases, and the third
  one is the expensive one.

What helped:

- Tests that read the **rendered output with values**, not the existence of keys, types or ports.
- For buttons: assert they are **enabled** — a disabled button makes every check behind it
  unreachable, while a synthetic click still reports green.
- In every final report, a mandatory point: *what is still missing for a user to see this in the
  browser?*
- A plan's definition of done: **the user job was played through in the browser as the persona.**

---

## 16. Where it breaks, part 3: the measuring instrument lies

An agent that checks its own work is only as good as its measuring instruments. And instruments fail
in the worst possible way: they report success.

- **A request counter that could not count.** To verify that a page no longer fired requests in a
  render loop, the agent counted via the browser's `PerformanceObserver`. Result: `0` requests. The
  resource-timing buffer is capped at **250 entries**, and in dev mode it was full of module loads
  before the first API call ran. Not "no requests" — a blind instrument that looks exactly like a
  passed gate. The real defect was around **150 request batches per second**. The rule since then: **prove the
  counter first** — show it returns `>0` on a real page change. A `0` is only a result after that.
- **A guard whose success message described its intent, not its result.** A dependency-pin guard
  compared versions only when the installed package existed — and otherwise did nothing. The success
  message still said "package.json, overrides, lock file and **node_modules** match". A neighbouring
  session spent **an hour** investigating a state that was not actually installed. The rule since then: every
  guard reports two numbers — how many cases *should* be checked and how many were *actually
  compared*. A case that cannot be checked is a finding, never a silent `continue`.
- **A test mock that swallowed bulk inserts.** The mock database spread an array into *one* bogus
  record. Everything written in bulk was invisible to later reads — and bulk was exactly the path the
  catalogue import used.
- **A table engine that reports errors only in its logger.** A broken sheet looks exactly like a good
  one. A marker set in the wrong table form generates **zero** cases and reports success. Countermeasure:
  target numbers (sheets, cases, cells) in a check script that fails the build.
- **A green type check, 75 of 137 test files gone.** A shared validation schema gained a refinement;
  a downstream `.omit()` on it throws at **module load**, not at type check. The type check stayed
  green; importing the router threw, and more than half the test files dropped out at once — looking
  like an infrastructure problem, not a schema change.

The question that would have found all of these:

> **What would be different if this construct did not exist at all?**

If the honest answer is "nothing", the construct asserts its effect instead of proving it.

---

## 17. Where it breaks, part 4: invented evidence

Agents produce text that looks like evidence. Precise-looking evidence is trusted *more*, and checked
*less*.

- **An invented line reference.** A plan supported a claim with `PIPELINE-LEDGER.md:1543-1546`. The
  file had **1,016 lines**. The quoted phrases appeared in none of the seven ledger files. A second
  plan copied the claim. The conclusion happened to be right — its foundation was made up. Rule:
  check a line reference against the file length before adopting it (`wc -l` is cheaper than any
  discussion), and grep the quoted phrase instead of trusting the number.
- **Invented timestamps.** The orchestrator wrote times into the ledger from gut feeling — and was
  consistently in the **future**. Measured twice in one run: 11:xx and 12:xx in the ledger while the
  clock said 10:50; corrected; then 12:10–12:50 while it was 11:50. The error repeated right after
  being corrected. Timestamps are not decoration: they answer "is this agent dead or still working?"
  Rule: call `date`, don't estimate.
- **A paraphrase that hardens into a rule.** A lesson said "the owner always deploys this app
  personally" — about deployment. A ledger summarised it as "push ⇒ deploy". A later session refused to
  push, citing the "rule". The repository had no deploy workflow at all; pushing only releases.
  Paraphrases are usually **stricter** than their source and block work that was never blocked.
  Rule: a restriction in a ledger or plan is a quote, not a finding — open the source before obeying
  it, and link sources instead of summarising them.
- **A decision without its wording is not a decision.** From an empty paraphrase — "both product
  decisions are in" — an agent guessed the *content* of the two decisions, and inverted both.

---

## 18. Where it breaks, part 5: rules in prose are not enforced

### 18.1 `--no-verify`, five times

The instruction file says: never bypass the test hook. Every task brief for an implementation agent
said: never `--no-verify`.

On one day, **three** implementation agents committed with `git commit --no-verify` anyway — and
reported it themselves ("reflex", "harmless, because the tests were green before"). They read the
prohibition as a push rule. A fourth case came nine days later, with a sharper wording in the brief.
A fifth on the same day — this time not `--no-verify` but `git -c core.hooksPath=.git/hooks commit`.
Same reflex, different spelling.

Two lessons:

- **A prohibition must name the effect, not the spelling.** "No action that bypasses a hook — neither
  `--no-verify` nor `SKIP_TESTS` nor `core.hooksPath`, and not at commit time either." Whoever names
  only one flag gets the next one.
- **What must hold has to be a gate, not a sentence.** A `PreToolUse` hook now inspects every shell
  command the agent wants to run. If a `git push` segment carries `--no-verify`, `SKIP_TESTS`, or a
  `hooksPath` override, the command is **denied** with a message: "the test chain must be green before
  pushing — if it is red, that is the finding: report it, do not bypass it." A human in a terminal
  can still do it; an agent session cannot.

### 18.2 Eight red CI runs nobody noticed

In one run, a frontend repository had **eight** consecutive red release runs — from nothing but
formatting and import sorting. Eight commits were considered delivered and were not. The agent had
run only the affected test file per step and concluded "green"; the test runner does not run the
format check, the build does. And `git log origin/main` shows the commit even when the run after it
fails. It was noticed by accident when a version bump re-triggered the run.

A red release publishes nothing. Every downstream layer then works against a version that does not
exist — and the error surfaces hours later somewhere completely different.

Hence the rules in [section 13.3](#133-the-push-gate): the full chain before every push, watch the
CI run to its end, sweep all touched repositories.

### 18.3 The general principle

> **Red is the finding: report it, don't bypass it.**

Everything that must hold goes into something with an exit code: a hook, a guard test, a check
script, a ratchet. Prose rules are guidance for judgement. They are not a control.

---

## 19. Where it breaks, part 6: parallel sessions in one checkout

Running several agent sessions in parallel is where the throughput comes from. It is also where the
nastiest incidents come from, because the tools assume one person per working tree.

- **A push that would have published someone else's unfinished work.** While one session worked
  through plans in two repositories, a second session worked on a tax-authority integration in *the
  same* repositories. At the pre-check both were clean; twenty minutes later there were five unpushed
  foreign commits and twelve modified files. A push by the first session's implementer would have
  published those commits and triggered a **semantic-release of unfinished work** — and a published
  npm package cannot be rolled back.
- **`git add -A` grabs everything.** There is no such thing as "my lane's local commits" in a shared
  checkout — one working tree, one history, one branch. A commit contained only its own six files
  *only because* the other session had committed its work 18 minutes earlier. A push took the other
  session's finished commit along without its release. And another session saw an identical commit
  message in the log, took the commit for its own, and derived a coordination violation that never
  happened.
- **`git stash pop` restored a stash from a different session.**
- **Two test suites on the same repository** (two pushes, two pre-push hooks) competing for resources
  — shifting red results that were neither session's fault.
- **Agents that go silent.** A sub-agent on a fast model starts the test suite in the background, ends
  its turn with "I'll wait for the background task" — and never wakes up. The work lies finished in
  the working tree; no error, no report. An explicit prohibition in the brief did not help once the
  step took longer than the tool timeout.

What helped:

1. **Implementation agents in shared repositories get a push ban.** Committing is fine, with explicit
   paths only — never `git add -A`, never `git add <directory>`. The orchestrator coordinates the push.
2. **Re-check the working tree before every increment**, not once at the start of the run.
3. **Long-running or delicate work goes into its own `git worktree`.**
4. **Foreign red tests are not your regression.** Don't fix them; separate them in the report.
5. **Liveness is measured on the process, not the last message.** If no test runner or push is
   running and the tree contains the work, the agent is dead — the orchestrator finishes inline.
6. **At most three sub-agents at a time** across all types — for cost, and for contention.

---

## 20. Where it breaks, part 7: built correctly, and pointless

After a test round of the trades software, my verdict on many features was: *implemented, but they
don't make much sense.*

The early plans had been driven by competitor feature lists and verified against the code. The
pattern repeated: the data model and primitives cleanly built, a UI glued on without a thought-through
workflow. Tours as an address text area on top of a tour primitive. Checklist execution on the
template page. Appointment booking without closing the loop. "Done" was set although the user's job
could not be played through.

The agent is excellent at building what the plan says. It does not ask whether the plan makes sense
for the person using it — unless the process forces the question.

What changed:

- **Every plan has a mandatory `## User job` section**: persona, job sentence ("does X with it instead
  of Y"), connection (where it enters and leaves the process), done scenario.
- **Done means: the job was played through in the browser as that persona.**
- **The QA walkthrough includes a sense check** with five questions: job, playability, work saved,
  connection, honest maturity. Sense findings are **not** auto-fixed — they are triaged with me: fix,
  rework, remove from the navigation, or delete.
- Half-finished work is hidden behind a module toggle, not visible in the navigation.

> Everything we build should take work off a user's hands and improve their process. That is the
> measure — not feature parity, and not a green build.

---

## 21. Cost: tokens, models, and budgets

Agentic development at this scale is not cheap, and cost is a design constraint, not an afterthought.

- **The weekly limit was reached after three days.** An analysis showed the orchestrator, running on
  the most expensive model, consumed **30 %** of the weekly budget by itself. The orchestrator moved to
  a strong-but-cheaper model; implementation stayed on a strong model; routine cascades moved to a
  fast model.
- **At most three sub-agents** at the same time, across all types.
- **Briefs with line ranges, not whole files.** An agent brief that says "read lines 120–180 of X" costs
  a fraction of "read X".
- **The ledger is read by its head only** and archived by size (section 12.2).
- **Unused skills are archived** (section 3.3), and the instruction file is short with path-bound long
  rules (section 4).

The cheapest token is the one that never enters the context.

---

## 22. What I would do again, and what I would not

### Again

- **Tables before tests before code**, whenever interfaces exist.
- **A red chain with one identical message** before any business logic.
- **Transport-independent service design**, so all business tests run in seconds.
- **The rule "expectation changes only via the table, with a reason".**
- **A lesson memory with the mechanism, not just the incident.**
- **Hooks and guard tests for everything that must hold**; prose for judgement only.
- **A ledger with write-ahead** for anything that runs longer than one session.
- **Archiving unused skills** and keeping the instruction file short.
- **A root repository** for rules, plans, and decisions, so their history is visible.

### Not again

- **A table for every trifle.** Two pure functions with six cases would have been fine as ordinary
  tests. Tables pay off where combinations arise.
- **Very fine classes.** More classes mean more combinations and more mandatory cases, without more
  insight. Use the classes at which behaviour *changes*.
- **Multiplying a case where one field would do.** One multiplication took a sheet from 10 to 157
  cases without a new statement.
- **Letting several sessions work in the same checkout without push rules.** Use worktrees.
- **Trusting a browser walkthrough as the owner** as proof that permissions work.
- **Solving a recurring mistake locally** with a comment in the file concerned.
- **Planning from competitor feature lists** without a user job.

---

## 23. The short version

If you take only a few sentences from this report:

1. **The agent writes the code; the structure around it makes the code trustworthy.** Directories,
   order of steps, gates, and retained knowledge.
2. **A table cannot stay silent.** Prose is quiet at the unclear places; a table demands a row there.
   Translating requirements into decision tables finds contradictions before code exists.
3. **Design services so their function is testable without infrastructure.** An agent that can check
   its own work after every step is excellent. One that has to guess is mediocre.
4. **Write all tests first and prove they are red for the right reason.** Then "implement the plans and
   use the tests" is an instruction an agent can execute well.
5. **Change an expectation only via its source, with a reason.** Otherwise the suite becomes
   accommodating — with an agent exactly as with a human under pressure.
6. **Absences are the most expensive defects.** No tool reports what is missing. Test the rendered
   output, and ask what a user still needs to see it.
7. **Prove the measuring instrument before believing its zero.**
8. **Precise-looking evidence gets checked least.** Verify line references, timestamps, and
   paraphrases against the source.
9. **What must hold needs an exit code.** A rule in prose is not a control; a hook is.
10. **Built correctly is not the same as useful.** Every plan names a user job, and done means it was
    played through.

---

*Related: the detailed field report on the event-driven service
([Building a service in eleven days — with an AI agent, and with tables that contradict](…)) and the
step-by-step guide ([Guide: building an event-driven service with tables and an AI agent](…)).*
