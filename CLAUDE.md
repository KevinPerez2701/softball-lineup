# Diamante 10 (softball-lineup)

## Project
Softball lineup builder (10 positions) as a single-file PWA: `index.html` (vanilla JS, no build), `stats.js`
(pure batting-stats logic), `sw.js` (offline cache), Firebase Auth + Firestore
(`users/{uid}/data/{current|team|saved|stats}`, JSON in field `json`). Published from this public repo via
GitHub Pages (branch `main`, root): everything committed here is served on the web.

## Commands
- Run: from the repo root `python3 -m http.server 8000 < /dev/null`, then open http://localhost:8000 (kill it after).
- Demos/QA by agents: serve on port 8001 (`python3 -m http.server 8001 --bind 127.0.0.1 < /dev/null`) and open
  **http://localhost:8001** — its own origin, separate from Kevin's localhost:8000 (Kevin, 2026-11-06). Not
  127.0.0.1, `[::1]` or `*.localhost`: the Firebase browser key's referrer list blocks them, so sign-in fails there.
  Signing in reaches Kevin's real Firestore data: demos stay read-only (close without saving, undo, reopen the saved
  game) unless Kevin asks for a write.
- Phone/touch QA: the Chrome-extension iframe reports `pointer: fine`, so `@media (pointer:coarse)` never applies there
  (a critique once scored 27 px targets that are 44 px on a phone). With the 8001 server up, run
  `node tools/phone-touch.mjs <out dir> [url] [width] [height] < /dev/null`: headless Chrome via CDP with touch
  emulation, the app started on a stub cloud and a 12-player test team (nothing reaches Firestore); it prints the
  check-in bar and the real tap height of each field slot and saves screenshots. Pass a `ver.html#p=…` URL for the
  public page. It kills Chrome and deletes its temp profile.
- Tests: `node --test 'tests/*.test.js'` (Node stdlib, no npm).
- Lint/build: none.

## Style and conventions
- Copy the style of `index.html`: ES5 `var`/`function`, helpers `el()`, `$()`, `lsGet/lsSet`, Spanish comments.
- User-facing text in Latin American Spanish.

## SDD (Spec-Driven Development)
- Read `STATUS.md` first, then `docs/constitution.md` and the active spec in `specs/`, before touching code.
- Follow the constitution; if a spec, plan or request conflicts with it, stop and ask.
- One task at a time from `specs/<NNN>/tasks.md`; update `tasks.md` and `STATUS.md` in the same commit as the code.
- Parallel where possible (Kevin, 2026-11-05): tasks with disjoint files run at the same time in worktrees outside
  the repo (`../softball-lineup-wt/Tn`), and independent agents (review, clarify, plan) run together.
- New behavior not in the spec → `/sdd:change` first.
- "What's left?" is answered by `/sdd:status`, from the files, not from memory.

## Limits
- Never push without asking (public repo). Never edit `firestore.rules` or Firebase config without asking.
- No npm dependencies.

## When any task ends
- `node --test 'tests/*.test.js'` green; for UI tasks, a manual check in the browser; no dev server left running.
- Update `STATUS.md` (Now, current/next task, last updated from `date`).
