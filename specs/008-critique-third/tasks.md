# Tasks — Spec 008 critique-third

Rules: tests first where there is logic; `[x]` only when "Done when" was observed. Never renumber. Plan: `plan.md`
("Orchestrator review" wins). Each task runs in its own worktree (`../softball-lineup-wt/008-Tn`); no git
stash/checkout/reset/clean, no repo-wide commands beyond `node --test 'tests/*.test.js' < /dev/null`; the orchestrator
merges and runs the browser checks (localhost:8001, Kevin's session, read-only).

Overlap map (index.html, lines of 98b4f4e): T3 41, 74, 104, 147, 171, 192–200, 285–288, 318, 443, 484, 601, 622, 799 ·
T4 570–571, new rule after 734, 3329, 3423–3469 · T5 695–702, 1229–1233, 3955–3957, 3977–3987 · T6 534, 2738–2743,
2825–2840, 2955 · T7 543–546, 2876–2893, 2905–2911, 3071–3084 · T8 656–663, after 720, 1302–1305, 1866–1887,
2784–2812 · T9 1282–1284, 1674–1678, 2336–2352. stats.js: T1 37–38 + after `fmt` (329); T2 after `cellLabel` (44),
194–220 (`paIndexes` + `cellName`), after `renumberOrd` (283). Tests: T1 edits sheet.test.js 79–91 and appends to
views.test.js; T2 appends to sheet.test.js.

## Wave 1 — in parallel
- [ ] T1. stats.js `STAT_COLS` reorder + `summaryLine`; tests first (`tests/sheet.test.js` 79–91 edited,
      `tests/views.test.js` append). (RF-1, RF-17) Deps: —
      Done when: the RF-17 test expects the new order, RF-1 cases (normal, 0 AP, 1.000) exist, suite green.
- [ ] T2. stats.js `paIndexes` (+ `cellName` reuses it), `turnLabel`, `innQuestion`; tests first (`tests/sheet.test.js`
      append). (RF-8, RF-11) Deps: —
      Done when: the plan's RF-8 and RF-11 cases exist (four rules, precedence, "1 carrera", 0–0 tie), the existing
      `cellName` tests untouched and green, suite green.
- [ ] T3. Lime/focus CSS: `--focus` tokens (root `--ink`, dark overrides removed, bar/gate/field `--bar-ink`, gate-card
      `--ink`), `accent-color` ink, no lime number square, delete `.btn-thin`, `.phone-only`, roster ✕ 32 px.
      (RF-3, RF-4, RF-5 except the tab bar, RF-6 CSS, RF-22 CSS, RF-23) Deps: —
      Done when: `grep -n -- '--focus' index.html` shows only `--ink`/`--bar-ink` values plus line 135; no `btn-thin`
      rule; `grep -c 'accent-color:var(--accent)'` = 0; print rule 871 unchanged; suite green.
- [ ] T5. Phone tab "Estadísticas": 4th `.tab` (chart icon, no badge, no `data-tab`) → `$("btnStats").click()`;
      `repeat(4,1fr)`; tabbar `--focus:var(--bar-ink)`; `.tab[data-tab]` selector; `btnStats` out of `SHEETS.more`;
      "Nuevo" after "Instalar". (RF-5 tab bar, RF-14, RF-19) Deps: —
      Done when: suite green; traced in the report: tapping the tab never calls `setTab`, `aria-current` never lands on
      it, the Más sheet lists Nuevo last before the separator and no Estadísticas; label width at 360 px measured.
- [ ] T8. Capture: `toast(msg, undo, sticky)` with ✕ "Cerrar aviso", `paDelete` sticky, `:has` padding under the
      toast at ≤680 px, `refreshCapSave()` from `refreshCheck` and the date handler, `#capSave` plain in HTML,
      "+ Inning" before "− Inning". (RF-7 capture, RF-12, RF-13, RF-21) Deps: —
      Done when: suite green; traced: "Campo vaciado" still 6 s; the delete toast has no timer; score typing and a
      cancelled picker keep it; render/close/next toast hide it; `#capSave` lime only with ≥1 turn and (never saved or
      changed); padding value stated.
- [ ] T9. Header "Guardar" lime only while dirty (plain "Guardar" with no linked game and nothing to save); Roster
      "Agregar" lime only with non-blank name (input listener + reset after submit); hint "(pestaña Orden)" in
      `span.phone-only`. (RF-7 header/roster, RF-22) Deps: —
      Done when: suite green; traced: the three header states (linked+clean, dirty, fresh+empty) give
      ghost "Guardado ✓" / key "Guardar" / ghost "Guardar"; Agregar toggles on typing and after adding.

## Wave 2 — after the dependency is merged
- [ ] T4. Stats dialog: summary line under the name, no AVE/OBP/OPS columns in the detail, `h3` tabindex −1 focused only
      from `openPlayerDetail`; `#statsView[open]` fixed height (82vh desktop, 90vh phone) with flex body; header on one
      line. (RF-1 UI, RF-2, RF-15, RF-16) Deps: T1
      Done when: suite green; traced: Enter on a name → focus on the `h3`; remote sync / sort redraws do not move
      focus; detail table has 9 columns; `[open]`-scoped display rule (closed dialog stays hidden).
- [ ] T6. Turn numbers: `paList` by `paIndexes` with `turnLabel`; picker title "· Turno n" (existing ord / `nextOrd`)
      outside the guide; cell "#n " at 11 px. (RF-8 UI, RF-9, RF-10) Deps: T2
      Done when: suite green; traced: Editar → "… · Inning 3 · Turno 2"; new turn → next number; guided title
      untouched; a cell's `textContent` reads "#9 1B".
- [ ] T7. Picker chips + inning question: `chip()` without `isDefault` (always `btn-default` when on), two-line chips
      with the cell label and `aria-label` = pick, `guideAsk` with `innQuestion` text and primary button. (RF-6 JS,
      RF-11 UI, RF-18) Deps: T2
      Done when: suite green; traced: chosen default values (CI 0, outs 1 for K) show the 2 px outline; Rolling/Línea/
      Fly sac. chips carry a small second line and keep their accessible name; the question's status line and primary
      follow the four rules.

## Wave 3 — orchestrator
- [ ] T10. Merge, full suite alone, browser pass (plan Test strategy) at 360×640 and desktop, light and dark, keyboard
      pass for RF-2/RF-12, decide the tab label width fix if needed, STATUS.md, one deploy on Kevin's OK, impeccable
      critique re-run. Deps: T1–T9
      Done when: every demo step observed and listed; critique snapshot saved.
