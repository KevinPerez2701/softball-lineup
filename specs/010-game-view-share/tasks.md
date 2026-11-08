# Tasks — Spec 010 game-view-share

Rules: tests first where there is logic; a task is `[x]` only when its "Done when" was observed. Never renumber.
Plan: `plan.md` ("Orchestrator review" wins). Parallel waves (Kevin, 2026-11-08): each task of a wave runs in its own
worktree outside the repo (`../softball-lineup-wt/Tn`, from the same HEAD), no repo-wide git commands, no full suite in
agents (own test file only); the orchestrator merges, runs `node --test 'tests/*.test.js' < /dev/null` alone and does
the browser checks on http://localhost:8001 (never 127.0.0.1, read-only unless Kevin OKs a write).

## Wave 0 — Kevin
- [x] T0. Firestore rules: Kevin pastes the plan's rules in the Firebase console and runs the 4 playground checks;
      STATUS gets the constitution §5 exception note. (RF-30) Deps: —
      Done when: anonymous get public allow; anonymous list public deny; anonymous get data/stats deny; anonymous
      create public deny.

## Wave 1 — in parallel
- [x] T1. [parallel-ok] stats.js view/share functions (`tally` refactor of `players`, `boxScore`, `BOX_COLS`,
      `resultLine` (ties "Empate", D1), `viewTitle`, `lineScore`, `publicCopy`, `IMG_COLS`, `IMG_COLS_MORE`,
      `imageTable`, `fileName`, `shareId`, `shareLink`, `parseShare`, `orphans`). Tests first. (RF-2–5, 12, 21, 23–27)
      Deps: —
      Files: `stats.js` (players 367–414, append after playerGames ~475), `tests/gameview.test.js` (new)
      Done when: `tests/gameview.test.js` green with the plan's cases; existing players tests unchanged and green.
- [x] T2. [parallel-ok] Batch check-in + "Anotar estadísticas" state: `Stats.batchAdd`/`addedMsg` (tests first),
      absent rows with checkboxes, "Agregar (n)"/"Vinieron todos", sticky toast + Deshacer (`undoBench`), focus, CTA
      note without button, RF-41 lime rule. (RF-32–39, RF-41) Deps: —
      Files: `stats.js` (after 579), `tests/bench.test.js` (append), `index.html` (1890–1900, 2232–2254, 2583–2629,
      CSS 466–468)
      Done when: bench tests green; `node --check` of the inline script OK; trace of select 2 → Agregar (2) → toast →
      Deshacer, Vinieron todos, selection kept through a redraw and cleared at a game switch, lime off/on.
- [x] T3. [parallel-ok] Capture sheet phone header: `#capBar`/`#capMore`/`#capTools[popover]`/`#capFoot`, phone CSS,
      toast above the bar. (RF-40) Deps: —
      Files: `index.html` (1321–1336, CSS after 734)
      Done when: `node --check` OK; desktop layout identical (trace of display:contents); phone CSS trace for one-row
      header, popover panel, bottom bar with safe area.
- [x] T4. [parallel-ok] CSS fixes: placeholder contrast (light and dark ≥ 4.5:1, computed), phone player detail two-line
      rows. (RF-42, RF-43) Deps: —
      Files: `index.html` (CSS after 224, CSS after 749)
      Done when: contrast numbers for both themes in the report; grid trace for 360 px.
- [ ] T5. [parallel-ok] `view.js` + `ver.html` + `sw.js` (v8, ASSETS, `/ver.html` navigate branch, `view.js`
      network-first). (RF-26–29, 31, F1) Deps: T1 contracts (stub `Stats.*` calls by name; merged after T1)
      Files: `view.js` (new), `ver.html` (new), `sw.js`
      Done when: `node --check view.js` and ver.html's inline script OK; trace of the RF-27/RF-28 paths; sw.js diff shows
      v8 + both assets + the navigate branch.

## Wave 2 — in parallel, after T1 and T5 are merged
- [x] T6. [parallel-ok] Game view in Estadísticas: Juegos row Ver/Editar/✕, `statsGame`, `renderGameView`, close
      listener, `<script src="view.js">`, the `unpublishQuiet(rec)` and `shareGame(rec.id)` calls. (RF-1–10, 19 hook)
      Deps: T1, T5
      Files: `index.html` (1380, 3471–3511, 3609–3629, CSS after 604)
      Done when: `node --check` OK; trace of open, switch, ← Juegos, close forgets, RF-9 redraw / list.
- [x] T7a. [parallel-ok] Share link: menu, publish/rewrite/unpublish, 6 s race, clipboard (F4), RF-17 hook, sweep, cloud
      methods, `ICONS.link`. (RF-11–22) Deps: T1, T0 for the live check
      Files: `index.html` (1625, 3259–3262, block after tryCloseCapture ~3302, 4265–4271, 4345–4347, 4390–4434)
      Done when: `node --check` OK; trace of every RF-11–22 branch; live check deferred to T9 (D4).
- [x] T7b. [parallel-ok] Game image: `svgToPng`, `buildGameSvg`, `gamePngBlob`, `shareGameImage`. (RF-23, RF-24)
      Deps: T1
      Files: `index.html` (3800–3840)
      Done when: `node --check` OK; trace of 11/16 columns, light palette, 12 innings, long names, share/download paths;
      lineup "Copiar imagen" path unchanged.

## Wave 3 — orchestrator
- [x] T8. Merge all, full suite, `node --check` of inline scripts, STATUS. Deps: T1–T7b
      Done when: suite green on main.
- [ ] T9. Browser demo on localhost:8001 (360×640 + desktop, light + dark): every RF; one real-game publish/unpublish
      with Kevin's OK; public link in a private window; ends unpublished. Deps: T0, T8
      Done when: checklist ✔/✘ per RF recorded in STATUS.
- [ ] T10. Deploy (push with Kevin's OK) and live check of `ver.html` from a phone with the app installed (F1).
      Deps: T9
      Done when: the public link opens the game there.
