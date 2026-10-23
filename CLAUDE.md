# Diamante 10 (softball-lineup)

## Project
Softball lineup builder (10 positions) as a single-file PWA: `index.html` (vanilla JS, no build), `stats.js`
(pure batting-stats logic), `sw.js` (offline cache), Firebase Auth + Firestore
(`users/{uid}/data/{current|team|saved|stats}`, JSON in field `json`). Published from this public repo via
GitHub Pages (branch `main`, root): everything committed here is served on the web.

## Commands
- Run: from the repo root `python3 -m http.server 8000 < /dev/null`, then open http://localhost:8000 (kill it after).
- Tests: `node --test 'tests/*.test.js'` (Node stdlib, no npm).
- Lint/build: none.

## Style and conventions
- Copy the style of `index.html`: ES5 `var`/`function`, helpers `el()`, `$()`, `lsGet/lsSet`, Spanish comments.
- User-facing text in Latin American Spanish.

## SDD (Spec-Driven Development)
- Read `STATUS.md` first, then `docs/constitution.md` and the active spec in `specs/`, before touching code.
- Follow the constitution; if a spec, plan or request conflicts with it, stop and ask.
- One task at a time from `specs/<NNN>/tasks.md`; update `tasks.md` and `STATUS.md` in the same commit as the code.
- New behavior not in the spec → `/sdd:change` first.
- "What's left?" is answered by `/sdd:status`, from the files, not from memory.

## Limits
- Never push without asking (public repo). Never edit `firestore.rules` or Firebase config without asking.
- No npm dependencies.

## When any task ends
- `node --test 'tests/*.test.js'` green; for UI tasks, a manual check in the browser; no dev server left running.
- Update `STATUS.md` (Now, current/next task, last updated from `date`).
