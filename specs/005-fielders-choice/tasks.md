# Tasks — Spec 005 fielders-choice

Rules: tests first where there is logic; a task is `[x]` only when its "Done when" was observed. Never renumber.
Plan: `plan.md` ("Orchestrator review" wins). Parallel waves (Kevin, 2026-11-06 "implementa de una vez en paralelo"):
each task runs in its own worktree outside the repo (`../softball-lineup-wt/005-Tn`, from the same HEAD), no repo-wide
git commands, no full suite in agents; the orchestrator merges, runs `node --test 'tests/*.test.js'` alone and does the
browser checks on http://127.0.0.1:8000 at the end. Spec 006 runs at the same time in other worktrees (stats views).

## Wave 1 — in parallel
- [x] T1. [parallel-ok] stats.js: JS entry with `title`, `group` on all 13 CODES, `PICK_GROUPS`, `pickRows`,
      `defaultOuts` + JS. Tests first. (RF-1, RF-2, RF-4, RF-5, RF-6) Deps: —
      Files: `stats.js` (CODES/PICK_CODES block and defaultOuts only), `tests/sheet.test.js`, `tests/outs.test.js`
      Done when: `node --test tests/sheet.test.js tests/outs.test.js < /dev/null` green with the plan's assertions.
- [x] T2. [parallel-ok] views tests only: "005 RF-3" players/rates/playerGames with JS, seq "JS•". No stats.js change
      expected (stop and report if one is needed). (RF-2, RF-3) Deps: —
      Files: `tests/views.test.js`
      Done when: `node --test tests/views.test.js < /dev/null` green.
- [x] T3. [parallel-ok] Undo of a deleted turn / runner out: `cap.undo`, `paDelete`, both "Borrar" through it,
      `renderCapture` drops a pending undo. (RF-7, RF-8, RF-9) Deps: —
      Files: `index.html` (`cap` in openCapture, renderCapture first line, paDone area, paList)
      Done when: suite green; traced in the report: delete ord 2 of 3 → Deshacer → ords 1-2-3; delete then add →
      undo dropped; delete then close → no-op; runner out delete/undo.

## Wave 2 — after T1 is merged
- [x] T4. Picker rows: `paForm.draw` renders `Stats.pickRows(codes)` as labeled rows; JS chip `title`/`aria-label`;
      legacy BO choice and the RF-42 list unchanged; chip `min-height` 44 px (D1). (RF-1, RF-4, RF-6) Deps: T1
      Files: `index.html` (paForm draw, `#paPick .dlg-body .btn` CSS)
      Done when: suite green; traced: free-cell new PA, guided mode, edit of a stored BO, JS → outs 1 and "Más
      detalles" closed.

## Wave 3 — orchestrator
- [ ] T5. Full suite alone; browser demo at 360 px and desktop on http://127.0.0.1:8000 (plan Test strategy list,
      D2 measured); STATUS.md; commit; push on Kevin's OK; post-deploy: Elias's 5th-inning PA of 05/11 → JS.
      (all RFs) Deps: T1–T4
      Done when: every demo step observed and listed.
