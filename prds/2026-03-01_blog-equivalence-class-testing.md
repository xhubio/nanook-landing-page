# PRD: Blog Post -- "Equivalence Class Testing: A Complete Guide"

## Metadata

| Field | Value |
|---|---|
| **Title** | Equivalence Class Testing: A Complete Guide |
| **URL Slug** | `/blog/2026/03/01/equivalence-class-testing` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-03-01 |
| **Word Count Target** | 1,500--2,000 words |
| **Status** | Draft PRD |

---

## Target Audience

- QA engineers and test leads looking for systematic test design techniques
- Software developers who write their own tests and want to reduce redundant test cases
- Engineering managers evaluating test optimization approaches
- Students and professionals studying ISTQB or similar testing certifications

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | equivalence class testing |
| **Secondary** | equivalence class partitioning, equivalence class table, test case design techniques, boundary value analysis vs equivalence partitioning, test data generation, systematic testing |
| **Long-tail** | how to create equivalence class tables, equivalence class testing example, equivalence class partitioning tutorial |

## Goal & Success Metrics

**Goal:** Rank on page 1 for "equivalence class testing" and related queries. Establish Nanook as the authoritative tool for automating equivalence class-based test design. Drive organic traffic from QA professionals actively researching this technique.

**Success Metrics:**
- Organic impressions for "equivalence class testing" within 90 days
- Top-20 ranking for primary keyword within 6 months
- CTR to quickstart page >= 3% of blog post visitors
- Average time on page >= 4 minutes

---

## Outline

### H2: What Is Equivalence Class Testing?

- Define equivalence class testing (also called equivalence class partitioning or equivalence partitioning)
- Explain the core idea: dividing input data into groups (classes) where all values in a class are expected to produce equivalent behavior
- Brief history and role in ISTQB Foundation Level syllabus
- Why it matters: reduces the number of test cases while maintaining coverage

### H2: How Equivalence Class Partitioning Works

#### H3: Identifying Input Fields and Their Domains
- Walk through a concrete example (e.g., a user registration form with age, email, and country fields)
- Show how each input field has a domain of possible values

#### H3: Defining Valid and Invalid Equivalence Classes
- Explain valid classes (values the system should accept) and invalid classes (values it should reject)
- Table example: age field with classes like "under 0", "0-17", "18-120", "over 120"

#### H3: Creating the Equivalence Class Table
- Show a complete equivalence class table in spreadsheet format for the registration form example
- Explain how rows represent test cases and columns represent input fields
- Note: this is exactly the format Nanook reads from Excel, LibreOffice, or Google Sheets

### H2: Equivalence Class Testing vs. Boundary Value Analysis

- Define boundary value analysis (BVA) briefly
- Comparison table: when to use each technique, what they cover, their strengths
- Explain how the two techniques complement each other
- Note that Nanook supports both approaches within the same equivalence class table

### H2: A Worked Example: Testing a Login API

- Full step-by-step example with a login endpoint (username, password fields)
- Define equivalence classes for each field
- Build the equivalence class table
- Show expected test cases derived from the table
- Highlight how many test cases are needed without vs. with equivalence partitioning

### H2: Automating Equivalence Class Testing with Nanook

- Introduce Nanook as a toolkit that reads equivalence class tables from spreadsheets
- Explain the workflow: define table in spreadsheet, attach data generators, run Nanook, get test data
- Show a code snippet of running Nanook against the login API example
- Mention output formats (JSON, CSV, custom)
- Highlight CI/CD integration for regenerating test data automatically

### H2: Best Practices for Equivalence Class Testing

- Keep classes mutually exclusive and collectively exhaustive
- Combine with boundary value analysis for critical fields
- Review classes with domain experts
- Automate the tedious parts (test data generation) while keeping the thinking human
- Use version-controlled spreadsheets so test specifications evolve with the codebase

### H2: Conclusion

- Recap the value of equivalence class testing
- Reiterate how Nanook eliminates the manual data generation burden
- CTA paragraph

---

## Internal Links to Include

| Link Text | URL |
|---|---|
| Quickstart guide | `/docs/quickstart/quickstart` |
| Tutorials overview | `/docs/tutorials/overview` |
| Equivalence class guide | `/docs/guide/equivalence/overview` |
| General overview | `/docs/guide/generalOverview` |
| Create an equivalence class table tutorial | `/docs/tutorials/createEquivalenceClassTable` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |

## Call to Action

Primary CTA at the end of the article:
> **Ready to automate your equivalence class testing?** Get started with Nanook in minutes. Follow the [Quickstart Guide](/docs/quickstart/quickstart) or explore the [Tutorials](/docs/tutorials/overview) to see it in action.

Secondary CTA (mid-article, after the worked example):
> Link to the `createEquivalenceClassTable` tutorial.

## Technical Requirements

- **Code examples:** 1 code block showing a Nanook CLI invocation or configuration snippet (JavaScript/Node.js)
- **Tables:** At least 2 HTML tables (equivalence class table example, comparison table for EC testing vs. BVA)
- **Screenshots:** Optional screenshot of a spreadsheet with an equivalence class table defined in it

### Diagrams (Excalidraw → PNG)

All diagrams are created as Excalidraw JSON files, rendered to PNG, and embedded as static images. Zero JS runtime cost.

**Workflow:**
1. Create `.excalidraw` JSON file in `/img/blog/`
2. Render to PNG: `cd .claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <path>`
3. Embed in HTML: `<img class="blog-diagram" src="/img/blog/filename.png" alt="descriptive alt text" width="800" loading="lazy" />`
4. Theme handling is automatic via CSS: `body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }`

**Style rules:** Dark background (`#0A0A0A`), `#E61919` red for invalid, `#4CAF50` green for valid, `#f59e0b` orange for caution, `#ffffff` text, `roughness: 0`, `fontFamily: 3` (monospace). Keep `.excalidraw` source files for future edits.

**Diagram 1 (CREATED):** "Equivalence Class Partitioning: Age Field"
- File: `/img/blog/equivalence-partitioning.png` + `.excalidraw`
- Content: Horizontal bar divided into 4 colored classes (EC1-EC4) with test values below
- Placed after "What Is Equivalence Class Testing?" section

## SEO Notes

| Element | Value |
|---|---|
| **Meta title** | Equivalence Class Testing: A Complete Guide -- Nanook |
| **Meta description** | Learn equivalence class testing with practical examples. Discover how to create equivalence class tables and automate test data generation with Nanook. |
| **og:title** | Equivalence Class Testing: A Complete Guide |
| **og:description** | A practical guide to equivalence class partitioning with worked examples and automation using Nanook. |
| **og:image** | `/img/social-card.png` (or a post-specific image if created) |
| **Schema.org type** | `Article` (follow existing blog post structured data pattern) |
| **URL** | `https://nanook.xhub.io/blog/2026/03/01/equivalence-class-testing` |

## Notes

- This is the highest-priority blog post because "equivalence class testing" is a core concept directly aligned with Nanook's value proposition.
- Use the same Docusaurus v1 blog HTML structure as the existing post at `/blog/2019/06/01/introducing/index.html`.
- Include the brutalist/CRT theme CSS classes consistent with the site design.
- Add structured data (`application/ld+json`) following the Article schema pattern from the existing blog post.
