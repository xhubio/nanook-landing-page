# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Nanook landing page** — a static website hosted on GitHub Pages at `nanook.xhub.io`. Nanook is a toolkit for test case and test data creation, combining equivalence class tables with data generators. The main project source lives at [github.com/xhubio/nanook-table](https://github.com/xhubio/nanook-table).

## Architecture

This is a **pre-built Docusaurus v1 site** — there is no build step, package.json, or dev server in this repo. All HTML, CSS, and JS are static assets served directly by GitHub Pages.

- `/index.html` — main landing page
- 🔴 ~~`/en/` — English locale mirror~~ — **existiert nicht** (geprueft 2026-08-21). Der Eintrag stand hier, ohne dass es den Ordner je gab.
- `/docs/` — pre-rendered API docs and guides (Docusaurus output)
- `/blog/` — pre-rendered blog posts
- `/prds/` — **Quelle**: Beitrags-Spezifikationen (Zielgruppe, Keywords, Gliederung, SEO). Ein neuer Beitrag faengt hier an, nicht im HTML
- `/css/main.css`, `/css/prism.css` — stylesheets (main.css is minified Docusaurus output)
- `/js/scrollSpy.js`, `/js/codetabs.js` — small utility scripts
- `/img/` — logos, icons, and illustrations (SVG and PNG)
- `/sitemap.xml` — XML sitemap
- `/CNAME` — custom domain config (`nanook.xhub.io`)

## Deployment

Pushing to `main` deploys automatically via GitHub Pages. There are no CI pipelines, build commands, or test suites.

> 🔵 **Arbeitsanweisungen stehen in `AGENTS.md`** — die sechs Stellen, an denen ein Beitrag
> registriert werden muss, die Theme-Regeln fuer Diagramme und die Fallen. Diese Datei hier
> beschreibt, WAS die Seite ist; AGENTS.md, WIE man daran arbeitet.

## Key Notes

- Pages like `/imprint.html`, `/privacyPolicy.html`, `/help.html`, `/users.html` exist both at the root and under `/en/` with an `index.html` variant for clean URLs.
- The CSS is minified and large (~28k tokens); prefer targeted edits over full rewrites.
- External dependencies are loaded via CDN (highlight.js, GitHub buttons).
