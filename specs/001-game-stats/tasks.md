# Tasks — Spec 001 game-stats

Rules: one task at a time; each ≤ 30 minutes of agent work; tests first; a task is `[x]` only when
its "Done when" was observed (command run, output seen). Dependencies are explicit. Never reorder
or renumber; append new tasks at the end (T16, T17…) and mark obsolete ones with ~~strike~~.

Test command: `node --test 'tests/*.test.js'`. Manual checks run the app with
`python3 -m http.server 8000 < /dev/null` from the repo root (killed afterwards) at phone width (360 px) and desktop.
All tasks touch `stats.js` or `index.html`, so they run sequentially (no parallel implementers).

## Part A — capture and save (shippable after T9)

- [x] T1. Skeleton: `stats.js` with `var Stats = {}` + `module.exports` guard; one smoke test that `require`s it;
      `<script src="stats.js">` before the main script in `index.html`; `sw.js` `ASSETS` += `"stats.js"`,
      `VERSION` → `v4`. (RF: — / NFR offline) Deps: —
      Files: `stats.js`, `tests/sheet.test.js`, `index.html` (script tag only), `sw.js`
      Done when: `node --test 'tests/*.test.js'` → 1 pass, 0 fail; the app loads with no console error and
      `typeof Stats === "object"` in the console.
- [x] T2. Sheet logic: `CODES`, `cellLabel`, `refreshRows`, `fit`, `minInnings`, `runCheck`, `signed`, `hasPA`,
      tests first (plan → Test strategy, Part A bullets). (RF-2, RF-5, RF-6, RF-8, RF-30, RF-31, RF-33, RF-36,
      RF-38) Deps: T1
      Files: `stats.js`, `tests/sheet.test.js`
      Done when: tests green, covering each listed RF case of the plan.
- [x] T3. Merge: `merge`, `live`, tests first (later wins, tie → marker, record after marker wins, one-sided kept,
      commutative, idempotent, `merge(x, [])`). (RF-14, RF-16) Deps: T1
      Files: `stats.js`, `tests/merge.test.js`
      Done when: tests green.
- [x] T4. Sync wiring: `K_STATS`, `SYNC`, `KEY_OF`; `applyRemote` else-branch via `KEY_OF[name]`; `mergeFirst`
      `stats` branch before the `current` fallback; watch `"stats"` + live merge path; backup export/import of
      `stats` with `Stats.merge`. (RF-13, RF-14, RF-16, RF-37) Deps: T3
      Files: `index.html`
      Done when: tests green; manual: a record written to `K_STATS` reaches `users/{uid}/data/stats` and a second
      browser; two browsers offline each add a different record → both present after reconnect; backup export
      contains `stats` and import of an old backup leaves records untouched; roster / saved lineups still sync
      as before.
- [x] T5. Capture screen shell: `#capture` dialog markup + CSS (sticky batter column, horizontal scroll only in
      the grid, ≥40 px cells), `btnCapture` in `.innings-head`, `openCapture(rec, fromCurrent)` with the open
      rules, grid render (rows, positions `BD`/`—`, cell labels, columns per `fit`). (RF-1, RF-8, RF-9, RF-12,
      RF-31, RF-35, NFR phone) Deps: T2, T4
      Files: `index.html`
      Done when: tests green; manual: button opens a sheet with the batting order and positions; empty order →
      "Primero arma el orden al bate"; at 360 px only the grid scrolls sideways and the batter column stays.
- [x] T6. Scoreboard in the capture screen: editable date, our/their runs per inning (`tfoot`), +/− innings with
      `minInnings`, run check headers in red with signed difference. (RF-5, RF-6, RF-30, RF-38) Deps: T5
      Files: `index.html`
      Done when: manual: a mismatching inning shows `+1`/`−1` in red and clears when fixed from either side;
      − stops at the highest inning with a PA (or 3).
- [x] T7. PA picker `#paPick`: add on an empty cell (code required, run/rbi/sb defaults), edit and delete a PA,
      "Otro turno en este inning" only with 1 PA. (RF-2, RF-3, RF-27, RF-28) Deps: T5
      Files: `index.html`
      Done when: manual: each of add / edit / delete / second PA works and the cell label updates (`Rol`, `1B•`);
      no toast appears under the picker.
- [x] T8. Rows: "Agregar sustituto" from `TEAM` players without a row, inserted below with position `—`,
      `S.order` unchanged; remove a row only when it has no PAs. (RF-4, RF-29, RF-36) Deps: T5
      Files: `index.html`
      Done when: manual: substitute appears under the right row, is not offered twice, `S.order` unchanged;
      "Quitar fila" (row menu ⋯) only on rows without PAs.
- [x] T9. Save and close: `saveCapture` (no PA / no date toasts, merge into `K_STATS`, write-back to the current
      game only while still linked, rollback when either local write fails), toast "Estadísticas guardadas";
      close guard on button / Esc / backdrop. (RF-7, RF-10, RF-11, RF-15, RF-32, RF-33, RF-34, RF-37, RF-39)
      Deps: T3, T6, T7, T8
      Files: `index.html`
      Done when: tests green; manual: save → reopen edits the same record with new order players appended;
      scoreboard edited in the sheet shows on the Juego tab; saved lineup round trip opens the same record;
      "Alineación nueva" → next save creates a new record; close with changes asks; both block toasts show.
      **Part A ships here** (commit; push only with Kevin's OK).

## Part B — views and calculations

- [x] T10. Player stats logic: `players`, `rates`, `fmt`, `sortPlayers`, label rule, tests first with the
      hand-computed fixture of the plan. (RF-18, RF-19, RF-20, RF-21) Deps: T2, T3
      Files: `stats.js`, `tests/views.test.js`
      Done when: tests green incl. `.333`, `1.083`, `.313`, `—`, nulls last both ways.
- [x] T11. Games logic: `games`, `playerGames`, tests first (order by date then `savedAt`, W/L/T, totals, `seq`,
      markers excluded). (RF-22, RF-23) Deps: T10
      Files: `stats.js`, `tests/views.test.js`
      Done when: tests green.
- [x] T12. `#statsView` dialog + ☰ entry (`btnStats`, `ICONS.chart`, `SHEETS.more`) + "Jugadores" table with
      sticky name column, totals row, tap-to-sort, empty state. (RF-17, RF-18, RF-19, RF-20, RF-21, RF-26)
      Deps: T9, T10
      Files: `index.html`
      Done when: manual: numbers match a hand count of the T9 demo game; sorting and `—` behave per RF-20;
      no records → "Todavía no hay juegos anotados".
- [x] T13. Player detail: tap a row → per-game lines + totals, "← Jugadores". (RF-22) Deps: T11, T12
      Files: `index.html`
      Done when: manual: lines newest first with the result sequence; totals equal the table row.
- [x] T14. "Juegos" view: summary (G-P-E, runs for/against), list, "Abrir" → capture (stored data, or RF-8 when
      it is the current game's record), delete with confirmation → marker. (RF-23, RF-24, RF-25, RF-26)
      Deps: T11, T12
      Files: `index.html`
      Done when: manual: open an old game shows its stored scoreboard; deleting asks, drops it from both views,
      and it does not come back on reload or on a second device.
- [ ] T15. Final validation: RF → test/demo traceability, full manual demo of the spec's Done criteria
      (offline + two devices), README section for stats. (All) Deps: T1–T14
      Files: `README.md`
      Done when: `/sdd:validate` reports every RF traced and the demo checklist passed.
