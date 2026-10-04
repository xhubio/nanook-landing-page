# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **Nanook landing page** — a static website hosted on GitHub Pages at `nanook.xhub.io`. Nanook is a toolkit for test case and test data creation, combining equivalence class tables with data generators. The main project source lives at [github.com/xhubio/nanook-table](https://github.com/xhubio/nanook-table).

## Architecture

This is a **pre-built Docusaurus v1 site** — there is no build step, package.json, or dev server in this repo. All HTML, CSS, and JS are static assets served directly by GitHub Pages.

- `/prds/` — **Quelle**: Beitrags-Spezifikationen (Zielgruppe, Keywords, Gliederung, SEO). Ein neuer Beitrag faengt hier an, nicht im HTML

## Deployment

Pushing to `main` deploys automatically via GitHub Pages. There are no CI pipelines, build commands, or test suites.

> 🔵 **Arbeitsanweisungen stehen in `CONTRIBUTING.md`** — die sechs Stellen, an denen ein Beitrag
> registriert werden muss, die Theme-Regeln fuer Diagramme und die Fallen. Diese Datei hier
> beschreibt, WAS die Seite ist; CONTRIBUTING.md, WIE man daran arbeitet.

## Key Notes

- The CSS (`/css/main.css`, minified Docusaurus output) is large (~28k tokens); prefer targeted edits over full rewrites.

