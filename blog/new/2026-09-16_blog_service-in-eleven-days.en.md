# A Service in Eleven Days, with an AI Agent and Tables That Contradict

*A field report. Anonymised: company and system names are replaced; the numbers are real.*

## What it is about

We built an event-driven service. It consumes messages from Kafka, keeps its state in Postgres,
publishes decisions back out as messages, and answers requests from a web UI over REST.

The domain is connections in regional rail. A passenger has to change trains and there is not enough
time. A partner system (I will call it the **connection controller** here) sends a **wait
request** to the control system: should the departing train wait? A dispatcher in the control
centre decides, or the deadline expires. The service manages those requests, their deadlines, and
the decisions.

Nearly all of the code was written by an AI agent in the terminal: a tool that can read and write
files and run commands. I designed, decided, reviewed, and contradicted.

After eleven days: 8,053 lines of source code in 54 files, 9,183 lines of tests, **806 tests**
(805 green, one skipped) in 44 files, 97 commits.

The interesting part is not the speed. It is the order: **first the tables, then the tests, then
the service.** And the finding that the tables broke the requirements before a line of code
existed.

## The tool in the middle: equivalence class tables

We use **Nanook**, a table engine that reads equivalence class tables from an Excel workbook and
derives test cases from them. Two forms matter:

- **Decision table**: what something *is*. Fields with their classes, and cases that cover
  combinations of classes. The engine computes what percentage of the combinations is covered.
- **Matrix table**: what something *becomes*. Rows are states, columns are events, each cell is the
  reaction.

Our workbook ended up with 13 sheets. Eleven of them generate test cases; two are building blocks
from which the matrix takes the meaning of its rows and columns.

| Sheet | checks | Cases | Combinations | Coverage |
|---|---|---|---|---|
| Request intake | the inbound message | 20 | 55,296 | 100 % |
| Worklist filters | the filters of the worklist | 24 | 21,600 | 100 % |
| Rejection | a rejection over REST | 13 | 864 | 100 % |
| Approval | an approval over REST | 13 | 768 | 100 % |
| Worklist query | the worklist | 11 | 256 | 100 % |
| Bulk action | bulk approval and rejection | 9 | 72 | 100 % |
| Deadline expiry | the expiry of a deadline | 8 | 30 | 100 % |
| Time conversion, request context | one pure function each | 6 + 6 | 18 + 18 | 100 % |
| Time-of-day resolution | a time without a date | 6 | 6 | 100 % |
| State transitions | 8 states × 14 events | 98 cells | — | 14 deliberate holes |

From these sheets, **214 test cases** are generated as **1,712 files**. A check script holds the
target numbers against them; if the workbook changes without the cases being regenerated, the test
chain aborts.

## Part 1: checking requirements by forcing them into a table

The designs were good. Twelve documents, cut by topic: data contract, data model, inbound
processing, responsibility, deadlines, outbound, the REST boundary, the UI, operations, test
integration. And still (this is the core of the report) it was **building the tables** that showed
the holes.

A table demands three things prose does not: **every field needs classes**, **every combination
needs a row**, **every row needs a result**. Whoever fills that in can no longer stay politely
vague.

What came out:

**A contradiction between two of our own artefacts.** A sheet claimed that a certain record would
be shown with a hint. The mapping rule and the code excluded exactly that record. Both cited the
same design decision. Nobody had noticed, because nobody had walked the sheet row by row.

**Seven filter criteria that had no effect**, even though tests existed that ran against a real
Postgres. The reason is instructive: an *empty* filter arrives correctly even if the implementation
throws it away. The existing test had been built around the gap. Only the table, with its classes
"set / empty / multiple", asked what happens for *set*.

**An intersection with no answer.** Priority 0 without a feeder: unclear in the domain. In the
table, that combination now stands as an explicit exception instead of a row that asserts a result
nobody decided. An open question that stays visible is better than a row that has to guess.

**A fourth cancellation case that was its own state.** In prose it read like a variant. In the
matrix it got its own row, because it reacts to three events differently from the others.

**Two numbers that did not match.** The UI shows 50 rows per page; the database design said
`LIMIT 20`. Both had been there for days, in two documents.

**The deadline does not decide.** Filling in the matrix showed that a deadline expiry sends no
message out. It only changes what the UI shows. The event is no longer called "deadline expired";
it carries the name of the trigger it really is, the tick that compares the departure. A wrong name
would have built an outbound message that must not exist.

**The matrix forced database columns.** Two columns of the model exist because one cell each
demands them: one to be able to withdraw a forecast that was set, one to distinguish who decided.
Without the cell, nobody would have asked for the column.

**And it separated "ignore" from "error".** In prose both looked the same: nothing happens. In the
matrix they are two different reactions, an expected non-reaction and an entry in the log. That
distinction became a design decision of its own.

That is the real value. **The table is not a test artefact; it is a verification tool for the
requirement.** It costs a day and finds things that would otherwise be found in production.

## Part 2: first the tests, then the service

After that, implementation ran in a fixed order, and the order was not negotiable.

**Step 1: the contract.** All types, all errors, all ports: 18 port methods and four pure
functions. Each of them throws "not implemented", with the same wording from one constant. No
behaviour, only shape. The type check is green.

**Step 2: the oracle.** A loader that reads the generated case folders, and **one** place that
translates the table's short codes into assertions. That translation is tested itself. Everything
else in the test code does not interpret; it passes values through.

**Step 3: red tests.** Not a few, all of them. First 112 red with 15 green (the green ones were the
tests of the oracle itself), then 245 red, **all with the same message**. A red chain is the target
state here, and it is checkable: if all 245 fail with "not implemented", the suite does not yet
test anything but itself.

**Step 4: the implementation, stage by stage.** Five stages, each with a prohibition:

1. **Pure functions**: see only their input. No clock, no database.
2. **Library against ports**: the business logic against fakes, with an injected clock.
3. **Persistence**: against a real Postgres engine in the process that replays the real DDL script.
   No business rule at this stage.
4. **Edges**: Kafka adapters, HTTP, configuration, startup and shutdown.
5. **End to end**: the service as a bundle, with a smoke test.

At the end of stage 2: **280 tests green, and not a single expectation changed.** Eight times
something had to be adjusted, and it was always the setup of the case, never the expected result.
Each of those eight corrections is recorded with a reason in the workbook or the design.

That is the rule that carries the whole approach: **when a test is red, change the code. If you
want to change the expectation, change the table first, and write down why.** Without that rule,
an AI agent (or a human under time pressure) rewrites the expectation until it passes.

**Step 5: counter-probes.** A green test proves nothing if it would also be green when the thing
does not work. So we deliberately broke seven safeguards and checked that exactly the right tests
turned red:

| Intervention | expected | measured |
|---|---|---|
| typo in a model column | the model gate fires | 2 red |
| a database constraint removed | the constraint is checked | 4 red |
| responsibility derivation disabled | assignment is effective | 5 of 8 red |
| leader row removed | only one instance decides | red |
| old withdrawal logic restored | the new path is effective | 1 red |
| local time instead of a fixed zone | the zone is pinned | exactly 3 red |
| empty filter list read as an empty set | empty means "no filter" | 13 red |

One lesson from this that cost time: **a counter-probe in the wrong place proves nothing.** On the
first attempt I rebuilt the old state at a spot the test does not touch. The test stayed green, and
that looked like a useless safeguard. It was not useless; the probe was in the wrong place.

## Part 3: from the Excel cell to the test file

The workbook is the source and is maintained **by hand**. A script generates the cases from it:

```
wait-request-processing.xlsx
        │   Nanook reads the sheets, resolves generators and references
        ▼
tests/fixtures/cases/<sheet>/<case>/   (8 files per case)
        │   a loader pulls them into the tests
        ▼
Vitest
```

Three details that make the difference:

**The generator does not interpret.** The table's short codes (`INS>OPEN`, `UPD>CLERK`, `IGN`,
`ERR`) travel unchanged into the case files. Interpretation happens at exactly one place in the
test code. Whoever puts the interpretation into the generator ends up checking their own
translation.

**"Nothing expected" is a written value**, not a missing one. The file then contains
`{"artefact": "none", "reason": …}`. A missing file can be forgotten; a written "none" checks that
really nothing happens.

**A matrix cell takes its meaning from two other sheets.** Row and column are references: the
prior state comes from a state sheet, the event from an event sheet. Before that, the matrix only
checked *whether* something goes out. Since the references, it checks *what*.

The test for the state matrix contains 98 tests, exactly the 98 occupied cells. It iterates over
the cases; it does not copy them. When a cell is added, a test is added, without anyone touching
test code.

## Part 4: ten gates, because an AI agent needs gates

`pnpm test` is a chain. Every link prevents something that has happened once already:

| Link | prevents |
|---|---|
| format, lint | arguments about formalities in every diff |
| type check as a **separate** step | the bundler throws types away instead of checking them |
| dead-code check | leftovers nobody removed after a refactoring |
| schema descriptor check | the message schemas drifting away from the code |
| workbook check | Nanook reports errors **in the logger**, not as an exception; without a gate a broken sheet looks like a good one |
| diagram check | the drawing in the README falling behind the workbook |
| cases check | the workbook changed, the cases not regenerated |
| build including smoke test | build green, types green, 391 tests green, and the bundle does not start (it happened exactly like that) |
| tests with coverage | the rest |

The real gate is not code coverage, though. It is the **coverage of the table**: every sheet has
to cover 100 % of its class combinations, or the workbook build aborts. Code coverage says which
lines ran. Table coverage says which *cases* were considered.

## What I learned about the collaboration

**The agent is fast, but it is accommodating.** Without the rule "change an expectation only with
a reason", I would have had a green test suite on day two that no longer asserted anything. The
rule costs nothing and is the most important sentence in the whole project.

**Tools that fail silently are the most expensive ones.** Three examples from these eleven days: a
marker that holds in one table form and not in the other; set wrongly, it generates *zero* cases
and reports success. A cell that has to stay empty although the documentation says otherwise. A
multi-line formatted array that a change script silently skips. Every time, the result was "all
green", and the check was gone. Hence the target numbers in the gate.

**A tool's documentation is a claim; its source code is the evidence.** Two passages of the skill
documentation contradicted the code. Both times the code won.

**What the agent does not replace is the decision.** The designs contain a decision log, and it
also records what was rejected: separate read and write paths, a drift gate of its own, state in
memory with a single instance, partitioning by responsibility, and a database lock for the tick.
The lock is the nicest example: it sounded right, but it could not be tested in the test
environment (there is only one session there, so both instances get the lock) and it would have
worked around the connection pool. Instead, leadership is a **row** in a table: pool-safe,
testable, self-healing.

**And: prose does not lie, it stays silent.** No design was wrong. They were vague at exactly the
places where the work later lies. A table cannot stay silent.

## The numbers, to close

| | |
|---|---|
| Duration | 11 days, 12 designs on the first |
| Commits | 97 |
| Source code | 8,053 lines in 54 files |
| Test code | 9,183 lines in 44 files |
| Tests | 806 (805 green, 1 skipped) |
| Table sheets | 13, of which 11 with cases |
| Generated cases | 214 with 1,712 files |
| Table coverage | 100 % per sheet; the gate aborts otherwise |
| State matrix | 8 × 14, 98 occupied cells, 14 deliberate holes |
