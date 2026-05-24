# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static, no-build Spanish-language web app with two calculators for entrepreneurs, deployed via GitHub Pages. No package manager, bundler, framework, or test suite.

## Running Locally

Open `index.html` directly in a browser, or serve with any static file server:

```
npx serve .
# or
python -m http.server
```

## Architecture

Single-page app with three files of consequence:

- **`index.html`** — Two `<section class="calculator">` blocks, one per calculator. All IDs referenced by JS are defined here.
- **`assets/js/main.js`** — All logic, no modules. Two independent sections separated by a comment:
  - *Percentage calculator*: `calculatePercentage()` reads `#percentage` and `#amount`, writes to `#result`. Calculates live on `input` events and on button click.
  - *Breakdown calculator*: driven by `breakdownConfig` array (each entry has `id`, `pctId`, `defaultPct`). Percentages must sum to exactly 100. User-entered percentages persist via `localStorage` keyed by `pctId`. Adding a new breakdown category means adding one object to `breakdownConfig` and the corresponding HTML in `index.html`.
- **`assets/css/main.css`** — BEM-ish CSS with custom properties defined in `:root`. Base font-size is `62.5%` so `1rem = 10px` throughout.

## Key Conventions

- Numbers are formatted for `es-MX` locale via `Intl.NumberFormat`.
- Validation messages use `breakdown__validation--error` / `breakdown__validation--ok` modifier classes.
- The breakdown percentage inputs are persisted to `localStorage`; income is never persisted.
