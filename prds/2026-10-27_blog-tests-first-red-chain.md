# PRD: Blog Post -- "Tests First, Then "Implement All Plans": Designing Services an Agent Can Verify"

## Metadata

| Field | Value |
|---|---|
| **Title** | Tests First, Then "Implement All Plans": Designing Services an Agent Can Verify |
| **Meta title** | Tests First, Then Implement All Plans · Nanook |
| **Subtitle** | Agentic software development, part 6 of 9: transport-independent design, the red chain, counter-probes |
| **URL Slug** | `/blog/2026/10/27/tests-first-red-chain` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-10-27 |
| **Word Count Target** | ~1,800 words |
| **Status** | Scheduled 2026-10-27 |
| **Type** | Series part / field report |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §10, §11; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 6 |

---

## Target Audience

- Developers and architects who let an AI coding agent implement and want it to verify its own work
  instead of guessing
- Teams building event-driven or message-consuming services (Kafka, Postgres, REST) who want a test
  suite that runs without the infrastructure
- Readers who practise test-first development and want to see what changes when the implementer is
  an agent

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | test-driven development with AI agents |
| **Secondary** | hexagonal architecture ports and adapters, testable event-driven service, AI coding agent verification, decision table test oracle |
| **Long-tail** | write all tests first then implement, tests fail with not implemented, testing business logic without Kafka, counter-probes for test suites |

## Goal

Show the two preconditions that make "implement the plans, use the tests" an instruction an agent
can execute well: a service whose business logic runs in a test without its infrastructure, and a
complete test suite that is red for a provable reason before any business logic exists. Give the
five-stage implementation order with its prohibitions, the red chain with its numbers (112/15, 245,
280, eight setup corrections), the rule that carries the approach, and the counter-probe table with
counted results.

## Outline

### Lede
- Recap in two sentences: requirements from outside, decision tables before code; that is an oracle,
  not yet a verifiable service. Two design decisions made before the first line of business logic.

### H2: Transport is an adapter at the edge
- The principle (§10.1) with the ASCII figure as a `<pre><code>` block; ports for persistence,
  outbound, clock, logging, external data; recorders and fakes in tests, Kafka/Postgres/HTTP in
  production.

### H2: Why this matters more with an agent
- Three points from §10.2: all tests run immediately; the agent can check itself constantly (the key
  point); adapters stay thin, rules at the edge are rules nobody tests.

### H2: Five stages, each with a prohibition
- Table from §10.3; the order as order of trust; stage 3 with an in-process Postgres replaying the
  real DDL script.

### H2: The red chain
- §11.1: contract (18 port methods, four pure functions, one "not implemented" constant), oracle
  (loader plus one tested translation of the short codes `INS>OPEN`, `UPD>CLERK`, `IGN`, `ERR`), red
  chain (112 red / 15 green, then 245 red with the same message). Why the identical message matters;
  check it by machine.

### H2: "Implement the plans. Use the tests to check the result."
- §11.2 instruction as blockquote; 280 green at the end of stage 2 with zero changed expectations;
  eight setup corrections, each documented with a reason. §11.3 rule as blockquote (verbatim); why it
  carries the approach; forward reference to part 8.

### H2: Counter-probes: break every safeguard once on purpose
- §11.4 table (seven interventions with counted results); two lessons: expect a number, place the
  probe where the test reads.

### Close
- Three rules: infrastructure-free function, all tests first and red for the right reason, change
  the code when red and expectations only via the table with a reason. No CTA (added at
  registration).

## Internal links
- `/docs/guide/equivalence/overview` (on "decision table" in the oracle step)

## Numbers used (all from the report)
- §10.3: five stages; stage 3 in-process Postgres with the real DDL script
- §11.1: 18 port methods; four pure functions; one constant; first 112 red and 15 green; then 245
  red with the same message
- §11.2: 280 tests green at the end of stage 2; zero changed expectations; eight setup corrections
- §11.4: counter-probe results 2 red, 4 red, 5 of 8 red, red, 1 red, exactly 3 red, 13 red
- Derived in the post: 22 strings (18 port methods + four pure functions) that the one constant
  replaces

## SEO block
- Meta description (≤ 160 chars): "Design a service an AI agent can verify without Kafka or Postgres, write all tests first, prove 245 are red for the same reason, then let the agent implement."
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-tests-first-red-chain/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-tests-first-red-chain/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL). To be moved to `prds/assets/linkedin-tests-first-red-chain/` at
registration. No image.

## Notes
- Nanook is not named in the body; the tables appear as "decision table" with a link to the
  equivalence guide, in the oracle step, not in the lede (AGENTS.md tone rule).
- The ASCII figure from §10.1 is rendered as a `<pre><code class="hljs">` block with the report's
  box-drawing characters; no SVG.
- The §11.3 rule is quoted verbatim including its em dash (`&mdash;`).
- The series plan's LinkedIn draft says the instruction is "nine words long"; in English it is ten.
  Kept verbatim in the English file as the brief requires; the German version uses a nine-word
  rendering ("Setze die Pläne um. Nutze die Tests zur Kontrolle.") so the count holds there.
- Part 8 is referenced forward once (the incidents behind the rule); no backward "as we saw"
  references. Series navigation is added at registration.
- The German field report and guide on the event-driven service (`2026-09-16_*`) are not yet
  translated; link from this part once they are published, as the series plan recommends.
