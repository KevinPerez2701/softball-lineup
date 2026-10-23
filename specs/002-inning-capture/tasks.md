# Tasks — Spec 002 inning-capture

Rules: one task at a time per implementer; each ≤ 30 minutes of agent work; tests first; a task is `[x]` only when
its "Done when" was observed. Never renumber; append T10, T11…; obsolete tasks get ~~strike~~.

Test command: `node --test 'tests/*.test.js'`. UI tasks: syntax check of the extracted main script with
`node --check`; the browser checks run once in T8 (verification budget).
Parallel work only in worktrees outside the repo (`../softball-lineup-wt/Tn`), merged by the orchestrator.

## Logic (stats.js) — sequential, one file
- [x] T1. Outs and cells: `RO_KINDS`, `roLabel`, `defaultOuts`, `paOuts`, `inningOuts`, `outsCheck`, `openInning`,
      `cellLines`, `rowEmpty`; `minInnings` counts `ro`. Tests first. (RF-1, RF-4, RF-6, RF-7, RF-8, RF-9, RF-12,
      RF-16, RF-17, RF-21) Deps: —
      Files: `stats.js`, `tests/outs.test.js` (new), `tests/sheet.test.js`
      Done when: tests green, incl. the plan's `outsCheck` and `minInnings` cases; spec 001 assertions unchanged.
- [x] T2. Batting sequence: `slots`, `activeRow`, `dueBatter`, `nextOrd`, `renumberOrd`. Tests first. (RF-3, RF-5,
      RF-10, RF-11, RF-19) Deps: T1
      Files: `stats.js`, `tests/guide.test.js` (new)
      Done when: tests green for every `dueBatter` case of the plan (no anchor, wrap, deleted anchor, sub with PA,
      2-PA skip, all full ⇒ null).
- [x] T3. Stats views: `players` (`cs`, ro-only rows count), `playerGames` (ro lines, seq with ro labels). Tests
      first. (RF-13, RF-14, RF-18, RF-12) Deps: T1
      Files: `stats.js`, `tests/views.test.js`
      Done when: tests green; existing views assertions unchanged.

## UI (index.html) — T4 ‖ T5 ‖ T7 in worktrees, then T6
- [x] T4. Picker: "Outs en la jugada" chips (preset/reset/store-only-if-different), `ord` on every new PA,
      `renumberOrd` on delete, runner outs listed with "Borrar", `roPick`, "Out corriendo" in the empty-cell picker,
      `done` callbacks on `paForm`/`paSubs`, `sub:true` on new substitutes. (RF-6, RF-10, RF-11, RF-16, RF-5 data)
      Deps: T1, T2
      Files: `index.html` (capture section: `paForm`, `paList`, `onCellTap`, `paSubs`, new `roPick`)
      Done when: tests green; main script passes `node --check`; reviewer traced: unchanged PA confirm ⇒ identical
      JSON (RF-12).
- [x] T5. Grid: `cellLines` rendering with small `ord`, header outs line ("<n> out" / "⚠ <n> out") next to the run
      diff without breaking `refreshCheck`, "Quitar fila" only when `rowEmpty`, CSS, `sw.js` v5. (RF-8, RF-9, RF-17)
      Deps: T1
      Files: `index.html` (`renderCapture`, `refreshCheck`, `onRowMenu`, capture CSS), `sw.js`
      Done when: tests green; `node --check` OK; reviewer confirms the run-diff mark still updates.
- [x] T7. Players table: `STAT_COLS` AR after BR. (RF-14, RF-18) Deps: T3
      Files: `index.html` ("estadísticas: ver" `STAT_COLS` only)
      Done when: `node --check` OK; reviewer confirms sort and totals use `cs`.
- [ ] T6. Guided mode: "Anotar por inning" button, `guide` state, `guideStart/Show/Advance/Ask`, "Otro bateador"
      (rows with < 2 PAs + "Agregar sustituto"), "Out corriendo" in the mode, "Terminar", `#paPick` close handler,
      `closeCapture` reset. (RF-1, RF-2, RF-3, RF-4, RF-5, RF-7, RF-15, RF-19, RF-20) Deps: T2, T4, T5
      Files: `index.html` (`#capture` head, new "modo guiado" block, `closeCapture`)
      Done when: tests green; `node --check` OK; reviewer traced a 3-out inning by PA and by runner out, the
      last-column ask and the 12-inning stop.

## Validation
- [ ] T8. Manual demo of the Done criteria (7 innings in the guided mode, double play, caught stealing closing an
      inning, substitute from "Otro bateador"; headers 3 outs; turn order in cells; AR in detail and table; a spec
      001 record opens unchanged), RF → test traceability, README line. (All) Deps: T1–T7
      Files: `README.md`, `STATUS.md`
      Done when: `/sdd:validate` reports every RF traced and Kevin's demo passes.
