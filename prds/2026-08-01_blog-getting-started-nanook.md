# PRD: Blog Post -- "Getting Started with Nanook in 5 Minutes"

## Metadata

| Field | Value |
|---|---|
| **Title** | Getting Started with Nanook in 5 Minutes |
| **URL Slug** | `/blog/2026/08/01/getting-started-nanook` |
| **Author** | Torsten Link |
| **Estimated Publish Date** | 2026-08-01 |
| **Word Count Target** | 1,000--1,500 words |
| **Status** | Draft PRD |

---

## Target Audience

- Developers who have just discovered Nanook and want to try it immediately
- QA engineers evaluating Nanook for their team
- Readers of the other blog posts (equivalence class testing, manual vs. automated) who are now ready to take action
- People who prefer a blog-format tutorial over documentation pages (more narrative, more context)

## Target Keywords

| Type | Keywords |
|---|---|
| **Primary** | getting started with Nanook |
| **Secondary** | Nanook tutorial, Nanook quickstart, test data generation tutorial, equivalence class table tutorial, Nanook setup |
| **Long-tail** | how to use Nanook for test data, Nanook table getting started, generate test data with spreadsheet |

## Goal & Success Metrics

**Goal:** Provide a shareable, self-contained blog tutorial that walks someone from zero to working test data generation in 5 minutes. This is a bottom-of-funnel post for people ready to try Nanook. It complements the existing quickstart docs with a more narrative, blog-friendly format that is easier to share on social media and developer communities.

**Success Metrics:**
- Highest quickstart page conversion rate of all blog posts (target >= 8% CTR to docs)
- Social shares >= 30 within first 30 days
- Average time on page >= 3 minutes
- Reduction in "how do I get started" questions in GitHub issues

---

## Outline

### H2: What You Will Build

- Brief description of the end result: a working Nanook setup that generates test data from a spreadsheet
- Mention what the reader will have after 5 minutes: a Node.js project with Nanook installed, a sample equivalence class table, and generated test data output
- Prerequisites: Node.js 14+ installed, a terminal, any spreadsheet editor (Excel, LibreOffice, Google Sheets)

### H2: Step 1 -- Install Nanook

- npm install command(s)
- Explain which packages are needed and why (`@xhubio/nanook-table` and any peer dependencies)
- Expected terminal output (brief)
- Troubleshooting note: Node.js version requirements

```bash
mkdir nanook-demo && cd nanook-demo
npm init -y
npm install @xhubio/nanook-table
```

### H2: Step 2 -- Create Your First Equivalence Class Table

- Open a spreadsheet editor
- Walk through creating a simple table with 2-3 input fields (e.g., a "Create User" form with name, email, age)
- Define 2-3 equivalence classes per field (valid, invalid, boundary)
- Define 4-6 test cases that combine these classes
- Save as `.xlsx` or `.ods`
- Reference to screenshot: "Your spreadsheet should look like this" (screenshot reference, not inline image)
- Link to the full `createEquivalenceClassTable` tutorial for more detail

### H2: Step 3 -- Configure Nanook

- Create a minimal configuration file (JavaScript)
- Explain each configuration option briefly
- Show the file contents with inline comments

```javascript
// nanook-demo.js
const { NanookTable } = require('@xhubio/nanook-table')

// Minimal configuration
const config = {
  // Path to your spreadsheet
  spreadsheet: './test-cases.xlsx',
  // Output format
  writer: 'json',
  // Output directory
  outputDir: './output'
}
```

(Note: adjust the actual API to match Nanook's real configuration interface -- verify against the GitHub repository before writing the post.)

### H2: Step 4 -- Run Nanook and Generate Test Data

- Run command from terminal
- Show the expected terminal output
- Show the generated JSON output (a few test case objects)
- Explain what each generated test case represents and how it maps back to the equivalence class table

```bash
node nanook-demo.js
```

Expected output:
```json
[
  { "name": "Alice", "email": "alice@example.com", "age": 25 },
  { "name": "", "email": "invalid", "age": -1 },
  ...
]
```

### H2: Step 5 -- Integrate with Your Test Framework

- Brief example of how to use the generated JSON in a test (Jest, Mocha, or generic Node.js assert)
- Show a 5-10 line test that reads the generated data and runs assertions
- Mention that this step is optional for the "5 minute" scope but is the natural next step
- Link to the full tutorials for CI/CD integration

### H2: What to Explore Next

- Add custom data generators for domain-specific values
- Use different output formats (CSV, custom writers)
- Integrate into CI/CD so test data regenerates on every commit
- Define more complex equivalence class tables with dependencies between fields
- Bulleted list with links to each relevant tutorial and guide page

---

## Internal Links to Include

| Link Text | URL |
|---|---|
| Quickstart documentation | `/docs/quickstart/quickstart` |
| Tutorials overview | `/docs/tutorials/overview` |
| Create an equivalence class table | `/docs/tutorials/createEquivalenceClassTable` |
| Create a custom generator | `/docs/tutorials/createGenerator` |
| Create a custom writer | `/docs/tutorials/createWriter` |
| Transform to data generator | `/docs/tutorials/transform2dataGenerator` |
| Create a filter processor | `/docs/tutorials/createFilterProcessor` |
| General overview | `/docs/guide/generalOverview` |
| Equivalence class guide | `/docs/guide/equivalence/overview` |
| GitHub repository | `https://github.com/xhubio/nanook-table/` |
| npm package | `https://www.npmjs.com/package/@xhubio/nanook-table` |

## Call to Action

Primary CTA:
> **You just generated your first test data with Nanook.** Now explore the [full tutorials](/docs/tutorials/overview) to learn about custom generators, advanced equivalence class tables, and CI/CD integration. Star us on [GitHub](https://github.com/xhubio/nanook-table/) if you found this useful.

Secondary CTA (mid-article, after Step 2):
> Need more detail on designing equivalence class tables? Read the [complete guide](/docs/guide/equivalence/overview).

## Technical Requirements

- **Code examples:** 4-5 code blocks (bash commands, JavaScript configuration, JSON output, optional test file). All code must be tested and verified against the current Nanook API before publishing.
- **Screenshots:** Reference 2-3 screenshots:
  1. The sample spreadsheet with the equivalence class table filled in
  2. Terminal output after running Nanook
  3. The generated JSON file open in an editor (optional)
- **Verification:** Before publishing, run through the entire tutorial from scratch on a clean machine to confirm all steps work with the latest Nanook version.
- **File downloads:** Consider providing the sample spreadsheet as a downloadable file in the `/blog/` assets directory.

### Diagrams (Excalidraw → PNG)

All diagrams: Excalidraw JSON → render to PNG → embed as `<img class="blog-diagram">`. Dark background (`#0A0A0A`), `#E61919` red, `#4CAF50` green, `#f59e0b` orange, `#ffffff` text, `roughness: 0`, `fontFamily: 3`. Keep `.excalidraw` sources in `/img/blog/`.

**Render:** `cd .claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <path>`
**Embed:** `<img class="blog-diagram" src="/img/blog/filename.png" alt="..." width="800" loading="lazy" />`
**Theme:** Automatic via CSS `body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }`

**Diagram 1:** "Nanook Workflow: 3 Steps"
- Assembly line pattern: Spreadsheet (Excel/LibreOffice icon) → Nanook Engine (green process box) → Output Files (JSON/CSV icons)
- Show actual file format examples inside evidence artifacts
- Place at the top of the article as hero diagram

## SEO Notes

| Element | Value |
|---|---|
| **Meta title** | Getting Started with Nanook in 5 Minutes -- Nanook |
| **Meta description** | A step-by-step tutorial to install Nanook, create an equivalence class table, and generate test data in under 5 minutes. Includes code examples and expected output. |
| **og:title** | Getting Started with Nanook in 5 Minutes |
| **og:description** | Install Nanook, define an equivalence class table in a spreadsheet, and generate your first test data -- all in 5 minutes. |
| **og:image** | `/img/social-card.png` |
| **Schema.org types** | `Article` + `HowTo` (the HowTo schema is ideal for step-by-step content and can win rich snippets in search results) |
| **URL** | `https://nanook.xhub.io/blog/2026/08/01/getting-started-nanook` |

## Notes

- This post must be validated end-to-end against the current Nanook release before publishing. Check the GitHub repo for the latest API and CLI interface.
- The code examples in this PRD are illustrative placeholders. The actual API calls must match `@xhubio/nanook-table`'s real interface.
- Consider adding HowTo structured data in addition to Article structured data -- Google can display HowTo rich results which would increase CTR.
- Use the same Docusaurus v1 blog HTML structure and brutalist theme as existing posts.
- This is the most shareable post of the four -- optimize for developer community sharing (Hacker News, Reddit r/softwaretesting, Twitter/X).
- The "5 Minutes" framing is a commitment: the tutorial must genuinely be completable in 5 minutes by someone with Node.js already installed.
