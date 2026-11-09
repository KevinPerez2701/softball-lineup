# Tasks — Spec 011 critique-fourth

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Each task runs in its own worktree (`../softball-lineup-wt/011-Tn`); no git
stash/checkout/reset/clean, no repo-wide commands beyond `node --test 'tests/*.test.js' < /dev/null`; the orchestrator
merges and runs the browser checks (localhost:8001, Kevin's session, read-only).

Overlap map (index.html, lines of 5faccc2): T2 468–474, new after 700, after 758, 903, after 1461, 2682–2748 · T3 after
504, 915–924, 1336, 1360, 1370, 1390, 1450, 2271, 2562, 3677, 3894, 4538 · T4 after 589, after 880, 3459, 3637–3646,
3807–3835 · T5 392, 1270–1273, 1417, 2021, 2046, 2061, 2085, 2326 · T6 620–623 + ver.html + sw.js. stats.js and tests: T1
only.

## Wave 1 — in parallel
- [ ] T1. stats.js: `RATE_KEYS`/`rankPlayers`, `recordText`, `SHORT_POS`/`shortPos`, `savedTitle`, `orderReason`,
      `publicHeader`; tests first (views, games 312–314 + append, names, order, gameview). (RF-10, 16, 17, 18, 20, 25)
      Deps: —
      Done when: the plan's test cases exist, games.test.js 312–314 expect the new record text, suite green.
- [ ] T2. Check-in bar: `#checkBar` HTML after 1461, CSS (468–474, new rules, offsets per plan RF-2), `renderAbsent`
      2698–2748 (bar text/aria/hidden, "Vinieron todos" first, in-list Agregar removed), static `#btnAddSel` listener.
      (RF-1–4) Deps: —
      Done when: suite green; traced: hidden on fold / n = 0 / game switch / other phone tab, shown again with the same n;
      CSS offsets listed (64 / 148 / 214 / 120 / 86).
- [ ] T3. Touch + focus: coarse block (`#statsBody .rowacts` gap 12, `.slot::before` + `--hit` per plan F1), h3
      `tabindex="-1"` on the 5 dialogs, `h3:focus{outline:none}`, focus at the 5 open sites (3894 only when `!dlg.open`).
      (RF-6, 7, 8) Deps: —
      Done when: suite green; the 5 dialog h3 carry `tabindex="-1"`; report lists `--hit` per slot and states no
      pseudo-element crosses the stage edge.

## Wave 2 — in parallel, after T1 is merged
- [ ] T4. Stats UI: `rankPlayers` in 3807–3835 + dim CSS + note, `savedTitle` 3637, plain status text 3644/3646,
      "estadísticas" 3459, phone `#statsView` h3 rule. (RF-16, 20, 22, 23, 24) Deps: T1
      Done when: suite green; dim ink contrast computed in light and dark (hover included) ≥ 4.5:1; header width at 360
      stated from the CSS.
- [ ] T5. Field + order: `phoneMq` + `shortPos` at 2061/2085, `.jersey.ghost{color:transparent}` on screen, legend 1417,
      `#orderWhy` + 2326. (RF-18, 19, 21, 25) Deps: T1
      Done when: suite green; print rule for `.jersey.ghost` still shows "–" (traced); label-width risk (plan F2) reported.
- [ ] T6. ver.html (og tags, 760 wrap, header via `publicHeader`, `<title>`, "Abrir Diamante 10", `load()` + `hashchange`
      + one cached Firebase init, stale responses dropped), line score cell rule in ver.html 195–201 and index.html
      620–623, `sw.js` v10. (RF-10–15) Deps: T1
      Done when: suite green; `grep -c 'property="og:' ver.html` = 4; traced: one `initializeApp` call, `seq` drops a stale
      response, RF-14 link to `./`.

## Wave 3 — orchestrator
- [ ] T7. Merge T2–T6, full suite alone, browser demo per the plan's Test strategy (DevTools touch for RF-6/7),
      `STATUS.md`, deploy on Kevin's OK, impeccable critique re-run after Pages builds. Deps: T1–T6
      Done when: every RF observed once with the measured sizes in STATUS; critique snapshot saved.
