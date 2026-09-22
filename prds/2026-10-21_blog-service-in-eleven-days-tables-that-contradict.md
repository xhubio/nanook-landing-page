# PRD: Blog Post -- "A Service in Eleven Days, with an AI Agent and Tables That Contradict"

## Metadata

| Field | Value |
|---|---|
| **Title** | A Service in Eleven Days, with an AI Agent and Tables That Contradict |
| **Meta title** | A Service in Eleven Days · Nanook |
| **URL Slug** | `/blog/2026/10/21/service-in-eleven-days-tables-that-contradict` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-10-21 (companion to part 5 of the series, one day after it) |
| **Word Count** | ~2,200 |
| **Status** | Scheduled 2026-10-21, registered 2026-09-22 |
| **Type** | Field report; series companion ("part 5b"), not a numbered part |
| **Source** | `blog/new/2026-09-16_blog_dienst-mit-ki-und-tabellen.md` (German original) → `blog/new/2026-09-16_blog_service-in-eleven-days.en.md` (English translation, 2026-09-22); the HTML is built from the English Markdown with pandoc |

## Target audience

- Readers of part 5 who want the whole service, not the eight findings alone
- Teams building event-driven services (Kafka, Postgres, REST) who want to see tables, red chain and gates on one real project

## Keywords

| Type | Keywords |
|---|---|
| **Primary** | event-driven service testing |
| **Secondary** | decision tables, state matrix, red chain, AI coding agent, Kafka Postgres service |
| **Long-tail** | tests first with an AI agent, table coverage as a build gate, counter-probes for test suites |

## Outline (the source's structure, kept)

1. What it is about (domain, roles, the eleven-day numbers, "first the tables, then the tests, then the service")
2. The tool in the middle: equivalence class tables (Nanook; decision vs matrix table; the sheet table; 214 cases / 1,712 files; target numbers in the gate)
3. Part 1: checking requirements by forcing them into a table (eight findings)
4. Part 2: first the tests, then the service (contract, oracle, red chain, five stages, 280 green, the rule, counter-probes)
5. Part 3: from the Excel cell to the test file (pipeline figure, three details, 98 matrix tests)
6. Part 4: ten gates (the chain table; table coverage as the real gate)
7. What I learned about the collaboration (accommodating agent, silent tools, docs vs code, the decision log, prose stays silent)
8. The numbers, to close

Series navigation top (companion to part 5, link to part 1) and bottom (part 5, part 6); closing link to the guide article.

## Translation notes

- Sheet names of the workbook are rendered in English (Request intake, Worklist filters, Rejection, Approval, Worklist query, Bulk action, Deadline expiry, Time conversion / request context, Time-of-day resolution, State transitions); the original names were German identifiers.
- Short codes as in the report: `INS>OPEN`, `UPD>CLERK`, `IGN`, `ERR`. Workbook file name rendered as `wait-request-processing.xlsx`.
- The partner system is called "connection controller" (Anschlussautomat), the request "wait request" (Warteanfrage). Domain kept: connections in regional rail.
- Nanook enters in section 2, not in the lede (tone rule).

## Numbers (all from the source; they also match the report §2, §9, §11)
11 days · 12 designs · 97 commits · 8,053 / 54 · 9,183 / 44 · 806 (805 / 1) · 13 sheets / 11 with cases · 214 / 1,712 · sheet table (20/55,296 · 24/21,600 · 13/864 · 13/768 · 11/256 · 9/72 · 8/30 · 6+6/18+18 · 6/6 · 98 cells, 14 holes) · 18 port methods / 4 pure functions · 112 red + 15 green → 245 red · 280 green, 8 setup corrections · counter-probes 2 / 4 / 5 of 8 / red / 1 / exactly 3 / 13 · 391 tests green and the bundle did not start · 8 × 14 matrix · 50 rows vs `LIMIT 20`.

## Registration
Twin; sidebar in all 40 blog pages (between part 6 and part 5 by date); teaser in `blog/index.html`; `feed.xml` + `atom.xml`; `sitemap.xml`; `llms.txt`. Part 5 links this post at its end; this post links part 5, part 6 and the guide article.

## SEO block
- Meta description: "An event-driven service in eleven days with an AI agent: 806 tests, 214 generated cases, and the eight requirement defects the tables found before any code." (156 chars)
- og:type article, Article JSON-LD, author Torsten Link

## LinkedIn companion
`prds/assets/linkedin-service-in-eleven-days-tables-that-contradict/linkedin-post.txt` (German, primary) and `linkedin-post-en.txt`.
