# Repository Guidelines

## Project Structure & Module Organization
- `bpmn-swimlane.gs` — Primary BPMN swimlane generator for Google Slides.
- `bpmn-ultra-lite.gs`, `bpmn-lite.gs` — Smaller variants for simplified flows.
- `web-app.gs` — Web entry for Apps Script; exposes functions called from HTML.
- `index.html`, `test-minimal.html` — Local demo/smoke-test pages for browser.
- `README.md`, `BPMN_DIALOGUE_PROMPT.md` — Usage and prompt docs.
- `package.json` — Node tooling scaffold (future tests with Playwright).

## Build, Test, and Development Commands
- Build: None required (Google Apps Script runtime).
- Local demo: Open `index.html` or `test-minimal.html` in a browser.
- Node tooling: `npm ci` to install, `npm test` reserved for Playwright e2e (add tests under `tests/`).
- Apps Script: Create a GAS project and copy `.gs` files. For web UI, serve HTML via a `doGet()` wrapper or use `web-app.gs` to bridge JSON → Slides.

## Coding Style & Naming Conventions
- Language: Google Apps Script (ES5/ES6 subset).
- Indentation: 2 spaces; include semicolons.
- Strings: Prefer single quotes for code, double quotes allowed for user-facing text.
- Naming: `camelCase` for functions/variables; `UPPER_SNAKE_CASE` for constants (e.g., `BPMN_COLORS`).
- File names: Keep `.gs` modules small and purposeful; avoid broad “utils”.

## Testing Guidelines
- E2E (recommended): Playwright tests in `tests/` or `e2e/` exercising `index.html` flows.
- Smoke testing: Manually run `index.html` and verify slide creation completes without console errors.
- Coverage: Prioritize core path generation (lanes, tasks, flows). Add regression tests for bug fixes.
- Naming: `*.spec.js` with clear, scenario-based names.

## Commit & Pull Request Guidelines
- Commits: Use Conventional Commits (e.g., `feat: add vertical swimlanes`, `fix: guard missing actors`).
- PRs: Provide a brief summary, linked issue, reproduction steps, and before/after notes or screenshots (when UI-visible).
- Scope: Keep PRs focused; refactors separate from features/fixes.

## Security & Configuration Tips
- Do not commit personal IDs, slide URLs, or credentials.
- If using `clasp`, keep project IDs and tokens out of VCS; add any `.clasp*` files to `.gitignore`.
- Validate inputs before generating Slides; log errors with context, not payloads containing sensitive data.

