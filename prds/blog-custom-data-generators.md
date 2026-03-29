# PRD: Blog Post -- "Custom Data Generators in Nanook: A Step-by-Step Guide"

## Meta

| Field               | Value                                                        |
|---------------------|--------------------------------------------------------------|
| **Title**           | Custom Data Generators in Nanook: A Step-by-Step Guide       |
| **URL slug**        | `/blog/2026/04/14/custom-data-generators`                    |
| **Author**          | Torsten Link                                                 |
| **Estimated publish date** | 2026-04-14                                             |
| **Word count**      | 1,200 -- 1,800 words                                        |
| **Status**          | Draft PRD                                                    |

---

## Target Audience

- Developers already using Nanook who need domain-specific test data beyond the built-in generators.
- Developers evaluating Nanook who want to understand how extensible the tool is before committing.
- Node.js / JavaScript engineers working in test automation.

---

## Target Keywords

| Type      | Keywords                                                                             |
|-----------|--------------------------------------------------------------------------------------|
| Primary   | "custom data generator Nanook", "Nanook test data generator"                         |
| Secondary | "write custom test data generator JavaScript", "equivalence class table generator", "synthetic test data Node.js", "Nanook extensibility", "pluggable data generators" |

---

## Goal & Success Metrics

### Goal
Demonstrate that Nanook's generator system is fully extensible, reducing friction for advanced users who need domain-specific test data (e.g., IBANs, VINs, custom IDs). Position Nanook as a developer-friendly toolkit, not a black-box.

### Success Metrics
| Metric                          | Target                          |
|---------------------------------|---------------------------------|
| Organic sessions (first 90 days) | 300+                           |
| Avg. time on page               | > 4 minutes                    |
| Click-through to docs (createGenerator tutorial) | > 15% of readers |
| GitHub star uplift (week of publish) | Measurable uptick           |

---

## Outline

### H2: Introduction -- Why Custom Generators Matter
- Brief recap: Nanook uses equivalence class tables + generators to produce test data.
- Built-in generators cover common types (names, emails, dates, numbers).
- Real-world projects need domain-specific data: IBANs, vehicle IDs, insurance policy numbers, medical codes.
- Custom generators let you plug in any JavaScript function and reference it from your spreadsheet.

### H2: Prerequisites
- Node.js 18+ installed.
- Nanook installed (`npm install @xhubio/nanook-table`).
- A basic equivalence class table already created (link to quickstart).
- Familiarity with JavaScript / TypeScript.

### H2: Anatomy of a Nanook Generator
- Explain the generator interface: what methods a generator must implement.
- Show the minimal contract (a `generate()` function that returns a value).
- Explain how generators receive context (the current test case row, field metadata, previously generated values for cross-field dependencies).

#### H3: The Generator Interface
- Code example: the base interface / class signature.
- Annotated line-by-line explanation.

### H2: Step 1 -- Create Your Generator File
- Create `generators/ibanGenerator.js`.
- Implement the `generate()` method that produces a random but structurally valid IBAN.
- Full code example (30-50 lines).
- Explain how to use external npm packages (e.g., `ibantools`) inside a generator.

### H2: Step 2 -- Register the Generator
- Show how to register the generator in the Nanook configuration / runner setup.
- Code example: registering by name so the spreadsheet can reference it.
- Explain naming conventions and namespacing for teams with many generators.

### H2: Step 3 -- Reference the Generator in Your Spreadsheet
- Screenshot or table mock-up of an equivalence class table with a generator command column.
- Show the syntax: `gen: ibanGenerator` (or however the command column works).
- Explain parameters: passing arguments from the spreadsheet to the generator (e.g., country code).

### H2: Step 4 -- Run and Verify
- CLI command to execute Nanook and generate output.
- Show sample JSON/CSV output with the IBAN values populated.
- Debugging tips: logging inside generators, common errors.

### H2: Advanced Patterns
#### H3: Generators That Depend on Other Fields
- Example: generating a city name that matches an already-generated country.
- Explain how to access previously generated values within the context object.

#### H3: Stateful Generators (Unique / Sequential Values)
- Example: auto-incrementing order IDs.
- Discuss uniqueness guarantees and reset behavior between runs.

#### H3: Async Generators
- Briefly mention support for async operations (e.g., calling an external API or database for reference data).

### H2: Testing Your Generators
- Unit testing generators with Jest or Vitest.
- Short code example for a test that validates output format.

### H2: Conclusion & Next Steps
- Recap the four steps: create, register, reference, run.
- Encourage readers to explore the full Generator API docs.
- Mention the community (GitHub Discussions) for sharing generators.

---

## Internal Links to Include

| Anchor Text                        | URL                                                    |
|------------------------------------|--------------------------------------------------------|
| Quickstart guide                   | `/docs/quickstart/quickstart`                          |
| Creating a generator (tutorial)    | `/docs/tutorials/createGenerator`                      |
| Generator command reference        | `/docs/guide/generatrorCommand`                        |
| Equivalence class table overview   | `/docs/guide/equivalence/overview`                     |
| Creating a writer                  | `/docs/tutorials/createWriter`                         |
| GitHub repository                  | `https://github.com/xhubio/nanook-table/`             |

---

## Call to Action (CTA)

Primary CTA at bottom of post:
> **Ready to build your first custom generator?** Follow our [step-by-step tutorial](/docs/tutorials/createGenerator) or jump straight to the [Quickstart guide](/docs/quickstart/quickstart) if you are new to Nanook.

Secondary CTA (sidebar / sticky):
> Star us on [GitHub](https://github.com/xhubio/nanook-table/) and join the conversation.

---

## Technical Requirements

| Requirement              | Details                                                                  |
|--------------------------|--------------------------------------------------------------------------|
| Code examples            | 4-5 JavaScript snippets with syntax highlighting (Prism.js already on site) |
| Spreadsheet screenshots  | 1-2 screenshots or HTML table mock-ups showing generator commands in an equivalence class table |
| Diagrams                 | See Excalidraw section below |
| Output samples           | JSON and/or CSV snippets showing generated IBAN data                     |
| Testing code             | 1 short Jest test example                                                |

### Diagrams (Excalidraw → PNG)

All diagrams: Excalidraw JSON → render to PNG → embed as `<img class="blog-diagram">`. Dark background (`#0A0A0A`), `#E61919` red, `#4CAF50` green, `#f59e0b` orange, `#ffffff` text, `roughness: 0`, `fontFamily: 3`. Keep `.excalidraw` sources in `/img/blog/`.

**Render:** `cd .claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <path>`
**Embed:** `<img class="blog-diagram" src="/img/blog/filename.png" alt="..." width="800" loading="lazy" />`
**Theme:** Automatic via CSS `body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }`

**Diagram 1:** "Generator Architecture"
- Fan-out pattern: ServiceRegistry (hub) → Built-in generators (Faker, Static) + Custom generators (IBAN, Email)
- Show how generators plug into the equivalence class table cells
- Place after "How Generators Work" section

---

## SEO Notes

### Meta Description (max 160 chars)
"Learn how to create custom data generators in Nanook. Step-by-step JavaScript guide for domain-specific test data like IBANs, IDs, and more."

### Open Graph Tags
| Tag             | Value                                                                    |
|-----------------|--------------------------------------------------------------------------|
| `og:title`      | Custom Data Generators in Nanook: A Step-by-Step Guide                   |
| `og:description`| Build domain-specific test data generators in JavaScript and plug them into Nanook equivalence class tables. Full code examples included. |
| `og:type`       | article                                                                  |
| `og:image`      | `/img/social-card.png` (or a custom card if budget allows)               |
| `og:url`        | `https://nanook.xhub.io/blog/2026/04/14/custom-data-generators`         |

### Additional SEO Guidance
- Use the primary keyword in the H1, first paragraph, and at least one H2.
- Include alt text on all screenshots describing the content shown.
- Add a `BlogPosting` JSON-LD schema block with author, datePublished, and description.
- Internal-link to at least 3 existing docs pages to strengthen site authority.
- Keep code blocks concise; overly long snippets hurt readability metrics.
