# Guide: Building an Event-Driven Service with Tables and an AI Agent

*The procedure, step by step. Derived from a service that was built this way: Kafka in, Postgres as
state, Kafka out, REST for a UI. Anonymised; company and system names are replaced.*

The guide is an order, not a kit. Every step assumes the previous one is finished. Whoever swaps
the order loses exactly the check that makes the step worthwhile.

## Overview

```
0  Housekeeping     repository, tools, gates
1  Cutting          the undertaking into small designs
2  First table      the inbound message as a decision table
3  State matrix     states × events, holes instead of error cases
4  Cross-check      design against table, both directions
5  Data model       columns that follow from cells
6  Contract         types, errors, ports; everything throws "not implemented"
7  Oracle           one place that interprets short codes
8  Generate cases   from the cell to the test file
9  Red chain        all tests red, with the same message
10 Implement        five stages, each with a prohibition
11 Counter-probes   break every safeguard once on purpose
12 Edges            adapters, real database, smoke test
13 Operations       several instances, heartbeat, cleanup
14 Gates            close the chain
```

## 0. Housekeeping: what comes before the first design

A repository with a chain that checks everything that can be checked by machine. Otherwise every
later check becomes an agreement nobody keeps.

- A formatter and a linter with a configuration that is not up for discussion.
- **Type check as a separate step.** Whoever builds with a bundler has no type check; bundlers
  throw types away instead of checking them.
- A test runner with a coverage report.
- A check for dead code.
- A session document for the agent in the repository root: what holds here, which traps are known,
  which rule is not negotiable. The agent reads it at the start of every session.

Rules that should be in there from the start:

1. **Tests first.** Contract, then oracle, then red tests, then code.
2. **An expectation is changed only after the table was changed first, with a reason.**
3. **No clock in the business logic.** Time comes in as a parameter.
4. **No migration tool in the data access.** The schema belongs to one place, the access to another.

## 1. Cutting the undertaking

A monolithic design is neither read nor checked. Cut by topic, one document per topic, each
self-contained enough that a plan of its own can come out of it.

A proven cut for an event-driven service:

| No. | Design | Defines |
|---|---|---|
| 00 | Overview | vision, core decisions, glossary, **decision log** |
| 10 | Data contract | the messages: fields, required, enum values, keys |
| 20 | Data model and persistence | tables, indexes, permissions, who migrates |
| 30 | Inbound processing | ordering, conflicts, idempotency |
| 40 | Responsibility | who sees and may do what |
| 50 | Deadlines and scheduling | tick, grace periods, what a deadline triggers |
| 60 | Outbound | which message leaves when |
| 70 | Interface to the UI | paths, roles, error shapes |
| 75 | UI | view, filters, page size |
| 80 | Operations | instances, health, alerts, cleanup |
| 90 | Test integration | how the service fits the existing test landscape |

Two things go into every document:

- **Open questions** as a section of their own. What is unclear stays visible.
- In the overview document, a **decision log** with numbers: decided, rejected, with the reason.
  The rejected alternative is the more valuable entry.

## 2. The first table: the inbound message

Take the message that triggers the service and build a decision table from it.

**Procedure:**

1. Choose the fields that control behaviour. Not every field of the message, only those where
   something is decided.
2. For every field, form **classes**: valid, boundary, missing, unknown enum value. Classes, not
   values.
3. Add cases until coverage is 100 %. The engine computes the combinations; it also says which one
   is still missing.
4. For every case, write down the **expected result**. "Nothing happens" is a value too, and it is
   written, not omitted.

**What you learn here, still without code:** which fields are required, which combinations are
forbidden in the domain, and where the design has no answer.

A field with four classes and a second with three give twelve combinations. If nobody can name a
result for two of them, you have found two open domain questions, on the first day.

## 3. The state matrix

The second artefact is the matrix: **rows = states**, **columns = events**, **cell = reaction**.

- Build the states first as a sheet of their own, the events as a second one. The matrix references
  both instead of copying them. That way every cell carries *which* prior state and *which* event
  is meant; otherwise the test later only checks that something happens.
- **A forbidden transition is a hole in the grid**, not an error case in a list. A hole is visible.
  A forgotten error case is not.
- Separate **"ignore"** from **"error"**. Both mean "nothing happens outwardly", but one is expected
  and the other belongs in the log. In prose the difference disappears.
- Keep the reactions as **short codes** (`INS>OPEN`, `UPD>CLERK`, `IGN`, `ERR`, `+OUT`). They have
  to fit in a cell and must not be prose.

**The matrix is where the data model emerges.** When a cell says "withdraw the forecast", you need a
column that records that one was set. No design demands such columns on its own.

## 4. Cross-check: design against table

Now the work that yields most of the benefit. Go both directions:

- **Design → table:** does every rule in the design have a row? If not, either the rule is
  superfluous or the table is incomplete.
- **Table → design:** does every row have a rule? If not, the table has guessed.

A list of questions that has proven itself:

1. Do two documents contradict each other in a number? (page size, limit, deadline, time window)
2. Does the table hold an expectation nobody decided?
3. Is an event named after its **effect** or after its **trigger**? A wrong name builds outbound
   messages that must not exist.
4. Is a "special case" of the prose really a state of its own? Check whether it reacts to at least
   one event differently from its neighbour.
5. Is there a class "empty" or "missing" for every optional field? That is exactly where the bugs
   sit that later tests do not find: an empty filter arrives correctly even when it is thrown away.

Record every finding: as an open question in the design, as an exception in the table, or as a
decision in the log. **No finding may stay only in conversation.**

## 5. Data model

Only now come the database tables. They follow from the matrix and the data contract.

- **One place migrates, another accesses.** The migration tool owns the schema; the data access in
  the service only knows it. Between the two belongs a **gate**: a startup run that touches every
  modelled column and aborts at the first one missing. An empty table is enough for that.
- Name permissions **per table**, not with a bulk statement over the schema; that one only applies
  to tables that already exist when it runs.
- Consider whether the service may delete at all. If not: mark instead of delete, and then a
  partial unique index, a filter in **every** read query, and a cleanup job in the database belong
  with it.
- Every query with `LIMIT` needs a **unique** ordering. Otherwise a row appears twice or never when
  paging.

## 6. The contract

Create everything, implement nothing:

- the types and schemas of the messages,
- the error classes,
- the **ports**: one contract each for persistence, outbound, clock, log, external data,
- the pure functions of the business logic.

Every method throws "not implemented", and does so with **one wording from one constant**. The
shared wording matters: it makes the red chain checkable.

The goal of this step: the type check is green, and there is no behaviour.

## 7. The oracle

The test code needs one place that turns a short code into an assertion, and only that one.

- A **loader** that reads a case folder into an object.
- An **interpretation** that translates `INS>OPEN` into "it was inserted, state open".
- That interpretation is **tested itself**.

Everything else in the test code passes values through. Whoever puts the interpretation into the
generator ends up checking their own translation against itself.

## 8. Generating cases

A script reads the workbook and writes one folder per case with files: input, prior state,
expectations, metadata.

Rules that have paid off:

- **The generator does not interpret.** Short codes travel through unchanged.
- **"Nothing expected" is a written value** with a reason, not a missing file.
- **Generated values carry a marker**, so that a run stays reproducible.
- **Orphaned files are deleted**, otherwise cases run that no longer exist.
- **Target numbers go into the check script** (sheets, cases, cells). Without them a silent change
  goes unnoticed.

## 9. The red chain

Write all tests before any business logic exists. Expected: **every** test red, **all** with the
same message.

This is the only moment at which you can prove that the tests assert something. Check the message
by machine, not by eye; the test runner can emit it as structured data.

A test that is red for another reason is a broken test. Found now, it costs minutes.

## 10. Implementing in five stages

| Stage | Subject | Prohibited |
|---|---|---|
| 1 | pure functions | no clock, no database, no message |
| 2 | business logic against ports | no real infrastructure; injected clock; recorders instead of adapters |
| 3 | persistence | **no business rule**; only that what is meant is written and read back |
| 4 | edges | configuration, startup, shutdown, adapters |
| 5 | end to end | the built bundle, smoke test |

For stage 3, a database engine that runs **in the process** and replays the **real** DDL script is
worth it. Then the test checks the schema, not an imitation of it.

Keep the rule: red → change the code. If the expectation does not fit, change the table first and
write down the reason. Correcting the **setup** of a case is allowed; moving the result is not.

## 11. Counter-probes

For every safeguard you built, one probe: remove the safeguard, run the tests, **count** what turns
red.

- Expect a **number**, not "something goes red".
- Place the probe **at the spot the test actually touches**. A probe in the wrong place stays
  green and makes a good safeguard look useless.
- Note the intervention and the number. That is the evidence that the suite holds up.

Candidates: the model gate, database constraints, the responsibility derivation, the time zone,
the interpretation of empty lists, concurrency.

## 12. Edges and smoke test

- Keep adapters thin: translate, do not decide.
- Read configuration once at startup, check it, and **abort** on missing required values instead of
  running on.
- **Smoke test on the built bundle.** Build green, types green, tests green, and the bundle does not
  start because an import is missing from the bundle. That is exactly what the probe is for.

## 13. Operations

- **Several instances** are the normal case. Keep no state in memory.
- Exactly one instance may drive the tick. Use **one row in a table** with instance name and
  timestamp for that, not a session lock: a lock hangs on the connection, your pool has several,
  and in a test engine with one session both instances get it.
- **Write a heartbeat, alert on its absence.** An alert on an error counter reports nothing when the
  process is no longer running at all.
- **Cleanup belongs in the database**, not in the service. A service that may delete can delete too
  much.
- A built image is not in operation: if the runtime definition pins the version, that needs a step
  of its own.

## 14. Closing the chain

Every check you built belongs in **one** command. Order from cheap to expensive:

```
format → lint → typecheck → dead code → schema drift →
workbook → diagram → cases → build + smoke test → tests
```

For every link: **it must be able to end with a non-zero exit code.** Tools that only log errors
need a check script that turns the error into an abort.

## The traps that cost time

| Trap | Effect | Remedy |
|---|---|---|
| the table engine reports errors only in the logger | a broken sheet looks healthy | a check script of your own with target numbers |
| a marker holds only in one table form | zero cases generated silently | check the case count against the target |
| the tool's documentation contradicts the code | a wrong assumption, no error | look in the source, record the finding |
| a multi-line formatted array | the change script changes nothing, reports success | measure the result at the parser, not at the script |
| expectation adjusted instead of the code | a green suite without a statement | rule: table first, with a reason |
| counter-probe in the wrong place | a good safeguard looks useless | place the probe where the test reads |
| bundler without type check | type errors wander into the repository | a `--noEmit` step in the chain |
| non-unique sort order | a row twice or never when paging | a second criterion with a unique value |
| bulk grant over the schema | a new table without permissions | permissions per table |

## What was not worth it

- **A table for every trifle.** Two pure functions with six cases would have been fine as an
  ordinary test. Tables pay off where combinations arise.
- **Very fine classes.** More classes mean more combinations and more mandatory cases, without more
  insight. Use the classes at which behaviour *changes*.
- **A case with "Multiply" where one field would do.** One multiplication took a sheet from 10 to
  157 cases without a new statement.

## The three sentences, if you take only three

1. **A table cannot stay silent.** Prose is quiet at the unclear places; a table demands a row
   there.
2. **An expectation is changed only via its source, with a reason.** Otherwise the test suite
   becomes accommodating, for a human under time pressure just as for an AI agent.
3. **What fails silently is more expensive than what aborts.** Every check needs a number and an
   exit code.

The field report on the service this guide was derived from is on the blog:
[A Service in Eleven Days, with an AI Agent and Tables That Contradict](/blog/2026/10/21/service-in-eleven-days-tables-that-contradict).
