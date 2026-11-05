# Tasks — Spec 004 critique-fixes

Rules: tests first where there is logic; a task is `[x]` only when its "Done when" was observed. Never renumber.
Plan: `plan.md` ("Orchestrator review" wins). Parallel waves (Kevin, 2026-11-05): each task of a wave runs in its own
worktree outside the repo (`../softball-lineup-wt/Tn`, from the same HEAD), no repo-wide git commands, no full suite
in agents; the orchestrator merges, runs `node --test 'tests/*.test.js'` alone and does the browser checks on
http://127.0.0.1:8000 (never localhost) at the end.

## Wave 1 — in parallel
- [x] T1. [parallel-ok] stats.js: `CODES` SF "Fly sac."/"FS", BO `legacy`, `PICK_CODES`, `COL_TITLES`;
      `Stats.games` `result ""`/`text` with the 0–0 rule; `Stats.pickResult`. Tests first. (RF-3, RF-4, RF-5, RF-6,
      RF-7, RF-8, RF-14, RF-15, RF-16, RF-17) Deps: —
      Files: `stats.js`, `tests/sheet.test.js`, `tests/views.test.js`
      Done when: suite green with the plan's new assertions (labels, 17 titles, games text + 0–0 + JJ, pickResult cases).
- [x] T2. [parallel-ok] Dialogs: `danger` on `askConfirm`/`askChoice`, `.btn-danger` resting red, the closed-list
      call sites, RF-10 still locked with Descartar red and focus on Recuperar, RF-2 capture close question. (RF-1,
      RF-2, RF-12, RF-13) Deps: —
      Files: `index.html` (CSS ~197, ask functions ~1725-1767, call sites ~1834, 1844, 2365, 2401, 3090-3093, 3129,
      3163, 3230, 3235, 3427; NOT ~3288)
      Done when: tests green; `node --check` OK; trace of every listed dialog in the report.
- [x] T3. [parallel-ok] Header save state: "Guardado ✓"/"Guardar". (RF-9, RF-18) Deps: —
      Files: `index.html` (renderHeader ~1654-1670, phone CSS ~684)
      Done when: tests green; `node --check` OK; trace of both states.
- [ ] T4. [parallel-ok] Field cards: no jersey on cards/titles, names 11.5 px with per-name shrink to 10 px,
      `fitSlotNames()`. (RF-10, RF-11) Deps: —
      Files: `index.html` (slot CSS ~320-328, ~762-765, ~814; renderField ~1916-1942; setTab ~3862)
      Done when: tests green; `node --check` OK; browser measurement at 360 px on 127.0.0.1 (names ≥ 10 px, no
      overlap with SF/4F/BD on).

## Wave 2 — in parallel, after T1 is merged
- [x] T5. [parallel-ok] Picker: `Stats.PICK_CODES` (no BO) and `Stats.pickResult` in `paForm`. (RF-3, RF-6, RF-14,
      RF-15) Deps: T1
      Files: `index.html` (paForm ~2838-2845)
      Done when: tests green; `node --check` OK; trace of new PA → HR → 1B, edit of an old HR, guided mode.
- [x] T6. [parallel-ok] Stats views: games list `x.text`, column `title`s and the `<details>` key, danger on the
      stats delete confirm. (RF-7, RF-8, RF-16, RF-17, RF-1) Deps: T1, T2 (askConfirm signature)
      Files: `index.html` (renderStatsGames/renderStatsPlayers ~3263-3345 incl. ~3288)
      Done when: tests green; `node --check` OK; trace.

## Wave 3 — orchestrator
- [ ] T7. `sw.js` VERSION v7; merged suite green; browser demo at 360 and 1440 px on 127.0.0.1 of every RF; STATUS.
      (NFR, Done criteria) Deps: T1–T6
      Files: `sw.js`, `STATUS.md`
      Done when: checklist ✔/✘ per RF recorded in STATUS.
