# Tasks — Spec 009 bench-attendance

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Each task runs in its own worktree (`../softball-lineup-wt/009-Tn`); no git
stash/checkout/reset/clean, no repo-wide commands beyond the task's own test file; the orchestrator merges and runs the
full suite and the browser checks (localhost:8001, Kevin's session, reversible).

Overlap map (index.html, lines of 97623df): T2 after 465, after 731, 1203 · T3 1841–1848, 1883, 2555–2585 · T4
2555–2585 (after T3), 1863. stats.js: T1 after `asNew` (559–567). Tests: T1 new `tests/bench.test.js`.

## Wave 1 — in parallel
- [x] T1. `Stats.absent(team, roster)` + `Stats.absentTitle(absent, roster)`; tests first in new `tests/bench.test.js`.
      (RF-6, RF-9 title, NFR) Deps: —
      Done when: the plan's cases (team order, empty team, all present, empty roster, stale name, team name/num, three
      titles) exist and `node --test tests/bench.test.js < /dev/null` is green.
- [x] T2. CSS: `#absent` rules after 465; phone RF-12 rule `body:has(> .toast.on) .wrap{padding-bottom:…}` in the 680
      block; `<h2>` of Banca (1203) gets `id="benchTitle" tabindex="-1"`. (RF-1 layout, RF-6 look, RF-11 target, RF-12)
      Deps: —
      Done when: rules present; inline scripts unchanged; the padding value is computed from the CSS (`.wrap` phone
      padding + toast height + offset) and stated in the report.
- [x] T3. "No vino": button in each bench row before "Agregar" (plain `btn btn-sm`, aria-label), snapshot, `benchUndo`
      + drop hook first in `save()`, sticky toast with undo, RF-5 guard, `refocusRow(listSel, btnSel, i)` helper used for
      the bench. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-11 bench) Deps: —
      Done when: traced in the report: the press removes him and BD, the toast is sticky, Deshacer restores roster and
      `S.dh` with the same order, any later `save()` hides the toast and drops the undo, a pre-existing player or a
      player gone from TEAM makes Deshacer a no-op; `node --check` on the extracted inline script passes.

## Wave 2 — after the dependency is merged
- [x] T4. Absent section: `renderBench` renders `details#absent.hint.no-print` in both branches from `Stats.absent` /
      `Stats.absentTitle`; rows jersey + name + "Vino" (no badge, not draggable); "Vino" copies the Roster checkbox add;
      `absentOpen`/`absentFor` reset on a new `S` and in `dropStored`; `toggle` listener; focus via `refocusRow`, else
      summary, else `#benchTitle`. (RF-6–RF-11, RF-13) Deps: T1, T3
      Done when: suite green; traced: empty game → "Equipo (n)" open; with players → "No vinieron (n)" folded; the
      user's choice survives Vino/No vino/team sync; Vino → end of bench + toast; with the banner → the existing question.
- [x] T5. Orchestrator: merge, full suite alone, browser pass (plan Test strategy) at 360×640 and desktop, light and dark,
      keyboard pass, confirm the RF-12 value, STATUS.md, one deploy on Kevin's OK. Deps: T2, T4
      Progress 2026-11-06 15:05: merge + suite + browser pass done (STATUS → Recently done). Left: Kevin's OK, deploy.
      Done when: every demo step observed and listed; the saved game reopened at the end.
