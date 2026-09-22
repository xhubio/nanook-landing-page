# PRD: Blog Post -- "One Root, Many Repositories: A Directory Layout and a Requirements Lifecycle for Agent Work"

## Metadata

| Field | Value |
|---|---|
| **Title** | One Root, Many Repositories: A Directory Layout and a Requirements Lifecycle for Agent Work |
| **Meta title** | One Root, Many Repositories · Nanook |
| **Subtitle** | Agentic software development, part 3 of 9: directories and the life of a requirement |
| **URL Slug** | `/blog/2026/10/06/directory-layout-requirements-lifecycle` |
| **Author** | Torsten Link |
| **Publish Date** | 2026-10-06 |
| **Word Count Target** | ~1,700 words (draft: 1,638) |
| **Status** | Scheduled 2026-10-06 |
| **Type** | Field report / setup |
| **Source material** | `blog/new/2026-09-17_full-report_agentic-software-development.md` §5, §6; `blog/new/2026-09-17_series-plan_agentic-software-development.md` part 3 |

---

## Target Audience

- Developers and architects deciding where plans, designs and rules should live when an agent does
  the implementation
- Teams with many repositories (multi-product SaaS with shared packages, or microservices) that need
  one layout the agent can navigate without being told
- Anyone who has had an agent re-implement a plan that was already done

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | requirements lifecycle for AI agents |
| **Secondary** | directory layout coding agent, root repository, analysis design plan done, microservices requirements per service, decision log |
| **Long-tail** | where to keep plans for Claude Code, multi-repo layout for AI agent, design outline event-driven service |

## Goal

Give the two directory layouts (multi-product SaaS with shared modules; event-driven microservices)
and the reason they differ at exactly one point, then the lifecycle a requirement passes through:
analysis or design, an outline of designs for a new service, a review after every design, decision
tables early, plans that ripple back into designs, and done meaning moved. The reader should be able
to set up the folders and the file-name pattern the same afternoon.

## Outline

### Lede
- Two-sentence recap; the most literal form of structure is a directory layout; same in both settings
  except at one point.

### H2: The root is a repository too
- The root tree (verbatim from §5.1). Why a repository: to see when a rule appeared and which
  incident caused it; 4,284 commits, more than most code repositories.

### H2: Two layouts, one difference
- SaaS tree (`REQUIREMENTS/<PRODUCT or TOPIC>/{analyse,design,plan,done}`, `repo/{products,packages,
  tools,mocks,archive}`), cross-cutting folders (core, general, E2E, blocked/deferred), the mechanical
  assignment rule as blockquote, every directory its own repository with its own release, ten or more
  repositories per shared change (pointer to part 7). Microservice tree (requirements per service,
  `contracts/`). The reason: ownership; the unit that is designed and released together. File-name
  pattern `<yyyy-mm-dd>_<analyse|design|plan>_<topic>.md`, example, daily sequence number, single glob.

### H2: Where to start: analysis or design
- Analysis when nothing is known (ends with findings and open questions); design as the normal start.
  For a new service, first an outline of designs; the 00–90 table verbatim; the outline sets the
  order; twelve designs on day one in the client project.

### H2: A review after every design, and tables early
- Review by me and often by a second agent that has not seen the conversation. Open questions as a
  section; numbered decision log in the overview, rejected alternative the more valuable entry.
  Decision tables among the first designs when interfaces exist (inbound, outbound, remaining API
  data); pointer to part 5.

### H2: Plans change designs: the ripple effect
- Plans after all designs: executable, files, tests, definition of done. Writing plans uncovers
  changes (column nobody modelled; design 60 vs design 30); ripples forward and sometimes backward;
  update the affected designs before the next plan.

### H2: Done means moved
- Design/analysis -> `done/` when its plans exist; plan -> `done/` when implemented, learning into the
  knowledge base (pointer to part 4). Not bookkeeping: everything in `plan/` is open work; status
  checked against the code, "a box that says done is a claim; the code is the evidence". Blockers
  leave the plan (`BLOCKED-DEFERRED/`, verify first, "no access" was self-service). Test plans in a
  central E2E folder.

### Close
- Four rules: root is a repository; requirements live with the unit designed and released together;
  designs first in outline order, review after each, plans may change designs; a document is what
  its folder says it is.

## Internal links
- `/docs/guide/equivalence/overview` (from "decision tables" in the review-and-tables section)

## Numbers used (all from the report; section in brackets)
- nine months, eleven days (§2, recap only)
- 4,284 commits in the root repository (§5.1)
- ten or more repositories per shared change (§5.2, referring to §13)
- file-name example `2026-09-15_plan_01-the-xsd-gate-fails-silently.md`, sequence starts at 01 (§5.4)
- outline numbers 00–90, ten designs (§6.2)
- twelve designs written on day one (§2)
- design 60 / design 30 example (§6.5)

## SEO block
- Meta description (152 chars): A directory layout for agent work, for a multi-product SaaS and for microservices, and the lifecycle a requirement passes through from analysis to done.
- og:type article, JSON-LD Article, author Torsten Link, publisher Nanook

## LinkedIn companion

Files: `prds/assets/linkedin-directory-layout-requirements-lifecycle/linkedin-post.txt` (German, primary) and `prds/assets/linkedin-directory-layout-requirements-lifecycle/linkedin-post-en.txt` (English, verbatim from
the series plan with the real URL). No image.

## Notes
- Both directory trees and the design-outline table are kept verbatim from §5 and §6.2 (arrows and
  box-drawing characters as in the report; `<` and `>` HTML-escaped). The tree keeps the report's
  spelling `knowlage-base/`, because that is the folder's real name; the Lektor should not "correct" it.
- Neither Claude Code nor Nanook is named in the body; the instruction file appears as `CLAUDE.md`
  in the tree only. The one Nanook touchpoint is the link on "decision tables".
- Verbatim from the report: the assignment rule (blockquote), "a box that says done is a claim; the
  code is the evidence", the file-name pattern.
- Left out on purpose: §5.3's sentence that the microservice tree has `src/, tests/, tables/` is in
  the tree itself, not repeated in prose. §6.4's cross-reference to §9 is a forward pointer to part 5.
  §6.6's knowledge base is named but not explained (part 4).
- Forward references: part 4 (knowledge base), part 5 (tables), part 7 (release cascades).
