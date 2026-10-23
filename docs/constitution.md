# Constitution — Diamante 10 (softball-lineup)

Non-negotiable principles. Every spec, plan and task must comply with them.
Change it only deliberately and with a note in STATUS.md that says why.

1. **Simplicity**: static site, vanilla JS in the style of `index.html`, no build, no framework. No new runtime
   dependencies; external loads stay Google Fonts + Firebase SDK (gstatic). Node stdlib only for tests.
2. **The spec rules**: nothing is implemented outside the active spec; a missing decision → stop and ask.
3. **Logic apart from UI**: stats calculations and validation are pure functions in `stats.js` (no DOM, no
   Firebase), testable in Node.
4. **Tests as the gate**: `node --test 'tests/*.test.js'` green before a task is done; UI tasks also get a manual check in
   the browser.
5. **Data**: per-user under `users/{uid}/data/*`. Existing `current`/`team`/`saved` formats stay backward
   compatible; no user data is ever lost.
6. **Offline first**: the app keeps working without signal; every new file goes into `sw.js` `ASSETS` and
   `VERSION` is bumped.
7. **Language**: user-facing text in Latin American Spanish; new identifiers in English; comments in Spanish like
   the file; SDD documents in English.
8. **Ask first**: new dependencies, `firestore.rules`, auth, deleting data, and every push (the repo is public).
