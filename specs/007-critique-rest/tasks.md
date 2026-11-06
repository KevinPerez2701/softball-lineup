# Tasks — Spec 007 critique-rest

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Each task runs in its own worktree (`../softball-lineup-wt/007-Tn`); no git
stash/checkout/reset/clean, no repo-wide commands beyond `node --test 'tests/*.test.js' < /dev/null`; the orchestrator
merges and runs the browser checks (localhost:8000, Kevin's session, read-only).

Overlap map (index.html, lines of c4dbadb): T3 2020–2054, 2551–2564 · T4 189–193, 1267, 1760–1761, 1794, 2198, 3964 ·
T5 2691–2695, 2734, paForm chip/nums/draw, 2984 · T6 588+, 3314–3318, 3379–3390, 3407–3409, 3452–3453 · T7 1000,
1149, 1153, 2574–2576, 2645–2655, 3255–3268. stats.js: T1 after `cellLines`, T2 after `result`.

## Wave 1 — in parallel
- [x] T1. stats.js `orderAfterAssign` + `cellName`; tests first (new `tests/order.test.js`, `tests/sheet.test.js`
      append). (RF-1, RF-2, RF-3, RF-6) Deps: —
      Done when: the plan's RF-1/2/3 and RF-6 tests exist and the suite is green.
- [x] T2. stats.js `dateLabel`, `sheetTitle`, `gameTitle`, `savedByDate`, `recordText`; tests first
      (`tests/games.test.js` append). (RF-13, RF-14, RF-15) Deps: —
      Done when: the RF-13/14/15 tests exist, the suite is green, the `gameName` test untouched and green.
- [x] T4. Lime CSS (`.btn-thin`, `.btn-sm.btn-default`) + RF-8 demotions. (RF-7 CSS, RF-8, RF-9) Deps: —
      Done when: every remaining `btn-key` in index.html is an RF-8 survivor (listed in the report); btnInstall has no key
      flag; RF-9 colors untouched.

## Wave 2 — after the dependency is merged
- [x] T3. Field/order: `setPos` append + no BD eviction, drop swap, `btnAutoField`. (RF-1, RF-2, RF-3) Deps: T1
      Done when: suite green; the code paths traced in the report (picker, drag, swap, Autoasignar, BD replaced, Quitar,
      open a saved game).
- [x] T5. Picker/capture: chip key + focus + thin/2 px classes, cell aria-label from `cellName`, `setCapTitle` from
      `sheetTitle`, "Agregar sustituto" plain. (RF-5, RF-6, RF-7, RF-8, RF-13) Deps: T1, T2
      Done when: suite green; traced: focus kept after a chip press (result, CI number, Anotó carrera); classes per state.
- [x] T6. Stats view: name button + focus back, tabs 2 px outline, Juegos `gameTitle`, `recordText`. (RF-4, RF-7,
      RF-13, RF-15) Deps: T2
      Done when: suite green; traced: Tab → name button → Enter → detail → back focuses the same button; row click opens.
- [x] T7. Labels: `#innPill`, "− Inning", `#scTag` visibility, "Abrir juego" by game date. (RF-10, RF-11, RF-12, RF-14)
      Deps: T2
      Done when: suite green; traced: pill follows ± Inning; Final hides at 0–0; list sorted and dated by game date.

## Wave 3 — orchestrator
- [x] T8. Merge, full suite alone, browser pass (plan Test strategy) at 360 px and desktop, STATUS.md; one deploy with
      005 + 006 on Kevin's OK; data ops: rename the 29/10 game, Elias's 05/11 PA → JS. Deps: T1–T7
      Done when: every demo step observed and listed.
