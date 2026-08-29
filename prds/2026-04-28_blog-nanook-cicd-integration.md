# PRD: Blog Post -- "Integrating Nanook into Your CI/CD Pipeline"

## Meta

| Field               | Value                                                        |
|---------------------|--------------------------------------------------------------|
| **Title**           | Integrating Nanook into Your CI/CD Pipeline                  |
| **URL slug**        | `/blog/2026/04/28/nanook-cicd-integration`                   |
| **Author**          | Torsten Link                                                 |
| **Estimated publish date** | 2026-04-28                                             |
| **Word count**      | 1,200 -- 1,800 words                                        |
| **Status**          | Draft PRD                                                    |

---

## Target Audience

- DevOps engineers responsible for CI/CD pipelines who need to integrate test data generation.
- Test automation leads looking for repeatable, version-controlled test data workflows.
- Engineering managers evaluating whether Nanook fits their existing toolchain.

---

## Target Keywords

| Type      | Keywords                                                                             |
|-----------|--------------------------------------------------------------------------------------|
| Primary   | "test data generation CI/CD", "automated test data pipeline"                         |
| Secondary | "Nanook CI/CD", "generate test data GitHub Actions", "test data GitLab CI", "synthetic data pipeline automation", "npm test data generation", "regenerate test data on commit" |

---

## Goal & Success Metrics

### Goal
Show that Nanook is not a standalone desktop tool but a first-class citizen in modern DevOps workflows. Prove that test data can be version-controlled, regenerated on spec changes, and cached for speed -- just like application code.

### Success Metrics
| Metric                          | Target                          |
|---------------------------------|---------------------------------|
| Organic sessions (first 90 days) | 500+                           |
| Avg. time on page               | > 3.5 minutes                  |
| Copy events on code blocks       | > 50 per month                 |
| Referral traffic from DevOps aggregators (DZone, Dev.to) | Measurable |

---

## Outline

### H2: Introduction -- Test Data as Code
- The problem: test data is often manually maintained, stale, or environment-specific.
- The principle: treat test specifications (equivalence class tables) as source artifacts and regenerate data on every pipeline run.
- Nanook is built with Node.js and designed for exactly this workflow.

### H2: Prerequisites
- A project that already uses Nanook for test data generation (link to quickstart if not).
- Familiarity with at least one CI/CD platform (GitHub Actions, GitLab CI, or Jenkins).
- npm / Node.js available in CI runners.

### H2: Project Structure for CI/CD
- Recommended directory layout:
  ```
  project/
    test-specs/          # .xlsx / .ods equivalence class tables
    generators/          # custom generator JS files
    nanook.config.js     # Nanook runner configuration
    output/              # generated test data (gitignored or committed)
    package.json         # npm scripts
  ```
- Discuss whether to commit generated output or regenerate every time (trade-offs).

### H2: npm Scripts Setup
- Define scripts in `package.json`:
  - `"generate"`: runs the Nanook CLI to produce test data.
  - `"generate:check"`: runs generation and diffs output against committed files to detect drift.
  - `"test"`: runs the test suite that consumes the generated data.
- Full `package.json` excerpt with scripts.

### H2: GitHub Actions Example
- Complete `.github/workflows/test-data.yml` file.
- Steps: checkout, setup Node, install deps, run `npm run generate`, cache `node_modules`, run tests.
- Trigger on changes to `test-specs/**` or `generators/**` paths.
- Show how to use GitHub Actions caching to speed up Nanook installs.
- Artifact upload: store generated data as a downloadable build artifact for debugging.

#### H3: Triggering Only When Specs Change
- Path filters in the `on.push.paths` and `on.pull_request.paths` configuration.
- Why this matters: avoid unnecessary regeneration on unrelated code changes.

### H2: GitLab CI Example
- Complete `.gitlab-ci.yml` stage definition.
- Steps mirror the GitHub Actions example but use GitLab syntax.
- Show `artifacts:paths` for passing generated data between stages.
- Show `rules:changes` for path-based triggering.

### H2: Generic Approach (Jenkins, CircleCI, Azure DevOps)
- Since Nanook is just an npm package, any CI that runs Node.js can use it.
- Provide a generic shell script snippet that works anywhere.
- Mention Docker: using a Node.js base image if the CI runner does not have Node pre-installed.

### H2: Regenerating Test Data on Spec Changes
- Workflow: a QA engineer updates an equivalence class table, pushes the spreadsheet to the repo, CI regenerates data automatically.
- Show a Pull Request workflow where the generated data diff is visible in the PR review.
- Discuss idempotency: running Nanook twice on the same specs should produce structurally identical output (seeded randomness).

#### H3: Seeded Randomness for Reproducibility
- How to configure a fixed seed so CI runs produce deterministic output.
- Why this is important for reproducible test failures.

### H2: Caching and Performance
- Nanook generation is typically fast (seconds), but for large spec files:
  - Cache `node_modules` between runs.
  - Cache generated output and skip regeneration if spec hashes have not changed.
- Show a checksum-based cache key strategy.

### H2: Advanced -- Multi-Environment Data Generation
- Different output profiles for dev, staging, production-like environments.
- Using environment variables or separate config files to control volume and shape of generated data.

### H2: Conclusion
- Recap: Nanook fits naturally into CI/CD because it is a Node.js CLI tool with deterministic output.
- Encourage readers to start with the GitHub Actions example and adapt.
- Link to full documentation.

---

## Internal Links to Include

| Anchor Text                        | URL                                                    |
|------------------------------------|--------------------------------------------------------|
| Quickstart guide                   | `/docs/quickstart/quickstart`                          |
| General overview                   | `/docs/guide/generalOverview`                          |
| Creating a generator               | `/docs/tutorials/createGenerator`                      |
| Creating a writer                  | `/docs/tutorials/createWriter`                         |
| Equivalence class table overview   | `/docs/guide/equivalence/overview`                     |
| GitHub repository                  | `https://github.com/xhubio/nanook-table/`             |
| npm package                        | `https://www.npmjs.com/package/@xhubio/nanook-table`   |

---

## Call to Action (CTA)

Primary CTA at bottom of post:
> **Start generating test data in your pipeline today.** Copy the [GitHub Actions example](#github-actions-example) above, or follow our [Quickstart guide](/docs/quickstart/quickstart) if you are new to Nanook.

Secondary CTA:
> Found a CI/CD integration pattern we missed? Open an issue or PR on [GitHub](https://github.com/xhubio/nanook-table/).

---

## Technical Requirements

| Requirement              | Details                                                                  |
|--------------------------|--------------------------------------------------------------------------|
| Code examples            | 3 full YAML files (GitHub Actions, GitLab CI, generic shell), 1 `package.json` excerpt |
| Directory tree           | ASCII art or styled `<pre>` block showing recommended project layout     |
| Diagrams                 | See Excalidraw section below |
| Screenshots              | Optional: GitHub Actions run log showing Nanook output                   |
| Reproducibility note     | Code snippet showing seeded random configuration                         |

### Diagrams (Excalidraw → PNG)

All diagrams: Excalidraw JSON → render to PNG → embed as `<img class="blog-diagram">`. Dark background (`#0A0A0A`), `#E61919` red, `#4CAF50` green, `#f59e0b` orange, `#ffffff` text, `roughness: 0`, `fontFamily: 3`. Keep `.excalidraw` sources in `/img/blog/`.

**Render:** `cd .claude/skills/excalidraw-diagram/references && uv run python render_excalidraw.py <path>`
**Embed:** `<img class="blog-diagram" src="/img/blog/filename.png" alt="..." width="800" loading="lazy" />`
**Theme:** Automatic via CSS `body[data-theme="swiss"] .blog-diagram { filter: invert(1) hue-rotate(180deg); }`

**Diagram 1:** "CI/CD Integration Flow"
- Timeline pattern: Git Push → CI Triggers → Nanook Generates Test Data → Tests Run → Deploy
- Show GitHub Actions / GitLab CI labels at the trigger step
- Place at top of article as hero diagram

---

## SEO Notes

### Meta Description (max 160 chars)
"Integrate Nanook test data generation into GitHub Actions, GitLab CI, or any pipeline. Full YAML examples, caching tips, and reproducibility patterns."

### Open Graph Tags
| Tag             | Value                                                                    |
|-----------------|--------------------------------------------------------------------------|
| `og:title`      | Integrating Nanook into Your CI/CD Pipeline                              |
| `og:description`| Automate test data generation in your CI/CD pipeline with Nanook. GitHub Actions and GitLab CI examples included. |
| `og:type`       | article                                                                  |
| `og:image`      | `/img/social-card.png` (or a custom card with CI/CD iconography)         |
| `og:url`        | `https://nanook.xhub.io/blog/2026/04/28/nanook-cicd-integration`        |

### Additional SEO Guidance
- Primary keyword ("test data generation CI/CD") should appear in H1, introduction, and at least one H2.
- Use semantic HTML for code blocks (language-tagged `<code>` for Prism.js highlighting).
- Add `BlogPosting` JSON-LD with author, datePublished, description.
- Cross-link to the custom generators blog post (when published) for internal link equity.
- Target featured snippet for "how to generate test data in CI/CD" with a concise numbered list in the introduction.
