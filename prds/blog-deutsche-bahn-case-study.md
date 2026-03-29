# PRD: Blog Post -- "How Deutsche Bahn Uses Nanook for Test Data Generation"

## Metadata

| Field | Value |
|---|---|
| **Title** | How Deutsche Bahn Uses Nanook for Test Data Generation |
| **URL Slug** | `/blog/2026/06/01/deutsche-bahn-case-study` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-06-01 |
| **Word Count Target** | 1,000--1,500 words |
| **Status** | Draft PRD |

---

## DISCLAIMER -- PRE-PUBLICATION REVIEW REQUIRED

This blog post references Deutsche Bahn by name as a Nanook user. Before publishing:

1. **Obtain written approval** from Deutsche Bahn's communications or legal department for any claims, quotes, or details included in this post.
2. **All placeholder quotes** marked with `[PLACEHOLDER]` must be replaced with real, approved quotes or removed entirely.
3. **Do not publish** without Deutsche Bahn's explicit sign-off on the final draft.
4. If approval cannot be obtained, rewrite the post as an anonymized case study ("a major European railway operator") and remove the Deutsche Bahn logo reference.

---

## Target Audience

- Enterprise engineering managers and test leads evaluating test data generation tools
- Decision-makers looking for proven, production-validated open-source solutions
- QA architects at large organizations with complex testing needs
- Potential Nanook adopters who need social proof from a recognized brand

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | test data generation case study |
| **Secondary** | Deutsche Bahn testing, enterprise test data generation, Nanook case study, automated test data, equivalence class table enterprise |
| **Long-tail** | how large companies generate test data, open source test data generation enterprise |

## Goal & Success Metrics

**Goal:** Provide E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) signals for the Nanook site. Demonstrate real-world enterprise adoption to build trust with potential adopters. Support the "Trusted By" section on the homepage with a detailed narrative.

**Success Metrics:**
- Referral traffic from search queries containing "Deutsche Bahn" + "testing" or "test data"
- Increased trust: conversion rate improvement on quickstart page for visitors who read this post first
- Backlinks from testing community sites or Deutsche Bahn's own tech blog (aspirational)
- Social shares >= 50 within first 30 days

---

## Outline

### H2: The Challenge -- Test Data at Scale for Critical Infrastructure

- Set the context: Deutsche Bahn operates one of Europe's largest railway networks
- The testing challenge: complex systems with many input parameters, regulatory requirements, need for systematic test coverage
- Pain points before Nanook: manual test data creation was slow, error-prone, and did not scale across teams
- Specific scope: mention the types of systems or projects where testing was needed (keep general if details are confidential)

### H2: Why Deutsche Bahn Chose Nanook

- Open-source and MIT-licensed -- no vendor lock-in, no licensing costs
- Spreadsheet-based test case definitions -- accessible to non-developers (testers, business analysts)
- Equivalence class tables as a proven, well-understood testing methodology
- Node.js runtime fits into existing CI/CD toolchains
- Customizable generators and writers for domain-specific data formats

### H2: The Solution -- Nanook in Production

#### H3: Architecture Overview
- High-level diagram of how Nanook fits into Deutsche Bahn's testing pipeline
- Spreadsheet authoring (who creates the tables, where they are stored)
- Generator configuration for domain-specific data (e.g., train schedules, booking references, customer profiles)
- Integration with CI/CD: when and how test data is regenerated

#### H3: Implementation Highlights
- Timeline from evaluation to production use
- Team size and roles involved
- How existing test cases were migrated into equivalence class tables
- Any custom generators or writers built for Deutsche Bahn's needs

### H2: Results

- `[PLACEHOLDER]` Quantitative results (e.g., "Reduced test data preparation time by X%")
- `[PLACEHOLDER]` Qualitative improvements (e.g., "Testers can now define new test scenarios without developer assistance")
- `[PLACEHOLDER]` Quote from a Deutsche Bahn team member
- Coverage improvements: how many more test combinations are now covered
- Maintenance benefits: spreadsheets are version-controlled and reviewed alongside code

### H2: Key Takeaways for Enterprise Teams

- Equivalence class tables make test specifications accessible to the whole team
- Open-source does not mean unsupported -- community and maintainer responsiveness matter
- Start small: pilot with one project, then expand
- Automate data generation early to avoid technical debt in test suites

### H2: Get Started

- Brief paragraph inviting readers to try Nanook for their own projects
- CTA with links

---

## Internal Links to Include

| Link Text | URL |
|---|---|
| Quickstart guide | `/docs/quickstart/quickstart` |
| General overview | `/docs/guide/generalOverview` |
| Custom generators tutorial | `/docs/tutorials/createGenerator` |
| Custom writers tutorial | `/docs/tutorials/createWriter` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |

## Call to Action

Primary CTA:
> **Want to see what Nanook can do for your team?** Follow the [Quickstart Guide](/docs/quickstart/quickstart) to generate your first test data in minutes, or explore how to [create custom generators](/docs/tutorials/createGenerator) for your domain.

## Technical Requirements

- **Diagram:** See Excalidraw section below.
- **Tables:** Results summary table with before/after metrics (use placeholders until real data is confirmed).
- **Images:** Deutsche Bahn logo already exists at `/img/users/deutschebahn.svg`. May reference it in the post header or as a sidebar element.
- **Code examples:** Optional -- a small snippet showing a custom generator configuration, if Deutsche Bahn approves sharing that level of detail.
- **Quotes:** 1-2 placeholder quotes that must be replaced with real approved quotes before publishing.

### Diagrams (Excalidraw → PNG)

All diagrams: Excalidraw JSON → render to PNG → embed as `<img class="blog-diagram">`. Dark background (`#0A0A0A`), `#E61919` red, `#4CAF50` green, `#f59e0b` orange, `#ffffff` text, `roughness: 0`, `fontFamily: 3`. Keep `.excalidraw` sources in `/img/blog/`.

**Render:** `cd .claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <path>`
**Embed:** `<img class="blog-diagram" src="/img/blog/filename.png" alt="..." width="800" loading="lazy" />`
**Theme:** Automatic via CSS `body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }`

**Diagram 1:** "Nanook at Deutsche Bahn: Architecture Overview"
- Assembly line pattern with fan-out: Spreadsheet → Nanook Engine → Test Data → CI/CD Pipeline → multiple Microservices
- Show DB logo reference, highlight scale (hundreds of services)
- Place after "The Solution" section

## SEO Notes

| Element | Value |
|---|---|
| **Meta title** | How Deutsche Bahn Uses Nanook for Test Data Generation -- Nanook |
| **Meta description** | Learn how Deutsche Bahn uses Nanook's equivalence class tables to automate test data generation across their railway systems. A real-world enterprise case study. |
| **og:title** | How Deutsche Bahn Uses Nanook for Test Data Generation |
| **og:description** | Enterprise case study: Deutsche Bahn automates test data generation with Nanook's equivalence class tables and custom data generators. |
| **og:image** | `/img/social-card.png` (or a post-specific image featuring DB logo with permission) |
| **Schema.org type** | `Article` |
| **URL** | `https://nanook.xhub.io/blog/2026/06/01/deutsche-bahn-case-study` |

## Notes

- This post has the highest external dependency: it cannot be published without Deutsche Bahn's approval.
- If approval is delayed, consider publishing the anonymized version first and updating later.
- The trust signal is valuable even anonymized ("a major European railway operator with 40,000+ daily train services").
- Use the same Docusaurus v1 blog HTML structure and brutalist theme as existing posts.
- Add Article structured data following the pattern in `/blog/2019/06/01/introducing/index.html`.
