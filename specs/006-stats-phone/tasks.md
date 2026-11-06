# Tasks — Spec 006 stats-phone

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Runs in its own worktree (`../softball-lineup-wt/006-T1`) in parallel with spec 005; no
repo-wide git commands, no full suite outside the worktree; the orchestrator merges and runs the browser demo.

- [x] T1. `Stats.STAT_COLS` + node tests, then render from it and add AVE/OBP/OPS to the player detail. Tests first.
      (RF-1, RF-2, RF-3) Deps: —
      Files: `stats.js` (after `COL_TITLES` only), `tests/sheet.test.js` (after the COL_TITLES test),
      `tests/views.test.js` (append), `index.html` (STAT_COLS, renderStatsPlayers, renderPlayerDetail only)
      Done when: `node --test 'tests/*.test.js' < /dev/null` green with "RF-1 STAT_COLS…" and "RF-3 detail rates…";
      `grep -c "var STAT_COLS" index.html` → 0; the detail's code path traced in the report.
- [x] T2. Orchestrator: merge, full suite, browser demo (plan Test strategy), STATUS.md, push on Kevin's OK. Deps: T1
      Done when: every demo step observed and listed.
