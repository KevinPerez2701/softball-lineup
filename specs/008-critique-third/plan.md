# Plan — Spec 008 critique-third

No code in this document. Planned 2026-11-06 by sdd-planner (fable); line numbers are of HEAD 98b4f4e (index.html 4345
lines, stats.js 642 lines). Format copied from `specs/007-critique-rest/plan.md`.

## Orchestrator review (wins over the rest)
- D1: the tab label is "Estadísticas"; T5 measures it at 360 px. If it clips, T5 applies the smallest fix that keeps
  the word (letter-spacing/font-size under 400 px) and reports the screenshot numbers; never "Stats".
- D2: RF-12 known gap accepted: closing `#paPick` in guided mode re-renders and drops the undo (pre-existing).
- D3: header "Guardar" keeps `saved = !!g && !dirty` for the "Guardado ✓" text; only the `btn-key` class moves to
  `dirty` (`dirty` is `Stats.unsaved`, the RF-35 "●" condition).
- D4: Kevin wants one deploy for 008 (2026-11-06, same as 005–007).

## Approach
Five small pure additions in `stats.js` carry what the NFR wants in node (summary line, turn label + a shared "PAs of a
cell by ord" helper, inning-question state, column order); `index.html` calls them at the existing choke points
(`renderPlayerDetail`, `paList`, `guideAsk`, `renderStatsPlayers`). Everything else is CSS tokens and class toggles at
the points that already decide them (`renderHeader`, `refreshCheck`, `chip()`, `toast()`). No new file, dependency,
data shape or `sw.js` bump (the worker already revalidates `index.html` and `stats.js` network-first; `VERSION` only
moves when `ASSETS` changes).

## Modules / files
| path | responsibility | RFs served | new/modified |
|---|---|---|---|
| `stats.js` | `summaryLine`, `paIndexes` (+ `cellName` reuses it), `turnLabel`, `innQuestion`, `STAT_COLS` order | RF-1, RF-8, RF-11, RF-17 | modified |
| `tests/views.test.js` | `summaryLine` cases | RF-1 | modified (append) |
| `tests/sheet.test.js` | `STAT_COLS` order test (lines 79–91) edited; `paIndexes`, `turnLabel`, `innQuestion` appended | RF-8, RF-11, RF-17 | modified |
| `index.html` | CSS tokens/classes + call sites (map below) | RF-1–RF-23 | modified |

## Data model
No change. `cap.rec`, `K_STATS` records, `K_SAVED`, `TEAM` and `S` keep their shape; `pa.ord` stays optional (legacy
turns without it must still render and list). `cap.opened` / `cap.rec.savedAt` are read, never written differently.

## Contracts (stats.js)
- `Stats.summaryLine(p)` → `"AVE <fmt avg> · OBP <fmt obp> · OPS <fmt ops> · <pa> AP · <g> JJ"`; `p` is a
  `Stats.players().rows` entry; rates through `Stats.fmt` ("—" for null). 0 AP → `"AVE — · OBP — · OPS — · 0 AP · 1 JJ"`.
- `Stats.paIndexes(row, inn)` → array of indexes into `row.pas` for that inning, by `ord` asc; PAs without `ord` after,
  in stored order. `Stats.cellName` is refactored to use it (its tests at sheet.test.js 219–250 stay green unchanged).
- `Stats.turnLabel(pa)` → `"Turno <ord> · <cell>"` (`"Turno · <cell>"` without numeric `ord`) + `" · anotó carrera"`
  when `pa.run`; `<cell>` = `CODES[].cell` or the raw code (unknown code), never with "•".
- `Stats.innQuestion(rec)` → `{text, yes}` (`yes` true ⇒ "Sí" is primary), first rule that applies, innings 1..n:
  1. `Stats.inningOuts(rec, i) > 3` → `"Inning <i>: <k> out"`, yes;
  2. `Stats.runCheck(rec)[i].diff !== 0` → `"Inning <i>: la hoja suma <x> carrera|carreras, el marcador <y>"`
     (`"1 carrera"`, else `"<x> carreras"`), yes;
  3. `sum(us) === sum(them)` (parseInt like `Stats.result`) → `"Empate <us>–<them>"` (U+2013), yes;
  4. else `"Los <n> innings tienen 3 out y cuadran con el marcador"`, yes = false.
  Pure; reads `rec.game.innings/us/them` and the rows only.
- `Stats.STAT_COLS` → `AVE, AP, OBP, SLG, OPS, JJ, VB, H, 2B, 3B, HR, CA, CI, BB, K, BR, AR` (keys
  `avg, pa, obp, slg, ops, g, ab, h, b2, b3, hr, r, rbi, bb, k, sb, cs`); the integer flag stays on everything but the
  four rates.

## index.html (per RF; HEAD lines)
- RF-1: `renderPlayerDetail` 3423–3469: after the `h3` (3435) a `p` with `Stats.summaryLine(p)`; drop `rates` (3437),
  its headers (3439, 3442 title branch simplifies), the empty cells (3454) and the Total rates (3464). `h3` gets
  `tabIndex = -1` (RF-2).
- RF-2: `openPlayerDetail` 3329 → after `openStats("players")` focus `#statsBody h3` if present. `openStats` (remote
  sync 4063/4068, sorting 3393) never focuses.
- RF-3: delete 318 `.slot.filled .slot-num{…}` (empty card = `--bar`/`--bar-ink` at 314). Print rule 871 untouched.
- RF-4: 443 and 484 `accent-color:var(--accent)` → `var(--ink)`.
- RF-5: 41 `--focus:#5d6b00` → `--focus:var(--ink)`; delete the dark overrides 74 and 104 (now follow `--ink`); 147
  topbar and 601 gate → `var(--bar-ink)`; 622 `.gate-card` → `var(--ink)`; 701 tabbar → `var(--bar-ink)`; add
  `--focus:var(--bar-ink)` to `.field-stage` 285–288. 135 unchanged.
- RF-6: `chip(label, on, fn, key)` 2878–2889 loses `isDefault`: class `on ? "btn btn-default" : "btn"`; `nums` 2893
  drops `v === def`; comment 2876 updated; delete CSS 194–196 (`.btn-thin`). `.btn-sm.btn-default` 198 stays (stats tabs).
- RF-7: header 1674–1678: `saved = !!g && !dirty`; text "Guardado ✓" only when `saved`; class `btn-key` only when
  `dirty`, `btn-ghost` otherwise. Capture: 1305 loses `btn-key`; new `refreshCapSave()` toggles `btn-key` on `#capSave`
  with `Stats.hasPA(cap.rec) && (!cap.rec.savedAt || JSON.stringify(cap.rec) !== cap.opened)`, called at the end of
  `refreshCheck` (2784–2795, runs after every render and scoreboard input) and from the `capDate` handler 2796. Roster:
  1282 loses `btn-key`; an `input` listener on `#newName` toggles it with `value.trim()`; the submit handler re-runs
  the toggle after clearing the field (2348).
- RF-8: `paList` 2825–2840 iterates `Stats.paIndexes(row, inn)` (idx stays the real index for `splice`) and prints
  `Stats.turnLabel(p)` at 2837; runner outs 2851 keep `Stats.roLabel`.
- RF-9: `paForm` just before `draw()` (2955): `if(!guide)` set `#paTitle` =
  `"<num · ><name> · Inning <inn>" + (src ? (numeric ord ? " · Turno <ord>" : "") : " · Turno " + Stats.nextOrd(cap.rec, inn))`.
  `guideShow` 3060 sets its own title after `paForm` — unchanged. `onCellTap` 2815 keeps the list title.
- RF-10: 2740–2741 → `small.ord` text `"#" + ord` followed by a text node `" " + l.text` (plain `l.text` without ord);
  CSS 534: `font-size:11px`, drop `margin-right` (the real space separates).
- RF-11: `guideAsk` 3071–3084: `q = Stats.innQuestion(cap.rec)`; a `p.ask-msg` with `q.text` before the buttons;
  "Sí" class `q.yes ? "btn btn-key" : "btn"`, "No" the opposite.
- RF-12: `toast(msg, undo, sticky)` 1869–1887: when `sticky`, no timeout and a third child `button` "✕" with
  `aria-label="Cerrar aviso"` that removes `on`; `paDelete` 2811 passes `true`. "Campo/Orden vaciado" (2522, 2579)
  unchanged → 6 s. Existing hide points already satisfy the spec: `renderCapture` 2706 (every turn/row/inning edit),
  `closeCapture` 3158, the next `toast()`; scoreboard/date inputs call `refreshCheck`/`setCapTitle` only; a picker
  cancel only closes.
- RF-13: in the 672 block after 720: `#capture:has(.toast.on) .dlg-body{padding-bottom:<measured>}` (value measured at
  360×640 in the task). `:has` is fine: the file already relies on `color-mix` and `cqw`.
- RF-14: HTML 1229–1233: a 4th `button.tab#tabStats` (no `data-tab`, no badge) with the `chart` icon path and
  `<span>Estadísticas</span>`; listener → `$("btnStats").click()`. 696 `repeat(3,1fr)` → `repeat(4,1fr)`; 3955 selector
  → `.tab[data-tab]` (else `setTab(undefined)`); 3981 removed from `SHEETS.more`. Focus return to the tab is
  `showModal`'s native restore — verified, not coded.
- RF-15: `#statsView[open]{height:82vh;display:flex;flex-direction:column}` (must be `[open]`-scoped),
  `#statsView .dlg-head{flex:none}`, `#statsView .dlg-body{flex:1 1 auto;max-height:none}` at 570–571; phone: a new rule
  after 734 `#statsView[open]{height:90vh}`.
- RF-16: `#statsView .dlg-head{flex-wrap:nowrap}`, its `h3{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}`,
  `#statsView .chips{flex-wrap:nowrap}` — same CSS hunk as RF-15.
- RF-17: `renderStatsPlayers` already iterates `STAT_COLS` — no change beyond stats.js.
- RF-18: `draw()` 2905–2911: after `chip(c.pick, …)`, when `c.cell !== c.pick` append `small` with `c.cell` and set
  `aria-label = c.pick` (JS keeps its `title` label, 2910). CSS near 543–546: `.pa-grid .btn{flex-direction:column;gap:0}`,
  `.pa-grid .btn small{font-size:11px;font-weight:400;color:var(--ink-3)}` (44 px min-height at 544 still holds).
- RF-19: `SHEETS.more` 3977–3987: the `btnNew` item moves after `btnInstall`, before `"sep"`.
- RF-20: CSS `#savedBody .rowacts{gap:16px}` (id beats the `(pointer:coarse) .rowacts{gap:8px}` at 823).
- RF-21: swap 1302 and 1303 (`+ Inning` first).
- RF-22: 1284 → `… <b>Orden al bate</b> <span class="phone-only">(pestaña <b>Orden</b>)</span>, usa …`; CSS
  `.phone-only{display:none}` at 171 and `.phone-only{display:inline}` in the 672 block near 799.
- RF-23: CSS after 200: `#teamRosterList .btn-icon{min-width:32px;min-height:32px;justify-content:center}` (phone 44 px
  at 821–822 wins there).

## Algorithms / rules
- `innQuestion` rule order is fixed by the spec: outs > 3 first, run mismatch second, tie third, else "all good". The
  question only appears when every inning has ≥ 3 outs (`guideStart`/`guideAdvance`), so rule 4's "3 out" is exact.
- Lime "tap now" states are derived, never stored: header from `Stats.unsaved`, capture from `hasPA` + `savedAt` +
  `opened`, roster from the input value.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null`. Node: `views.test.js` RF-1 (`summaryLine` normal, 0 AP, 1.000 rates);
`sheet.test.js` RF-17 (edit the two arrays at 80–83, the rate-flag assertion stays), RF-8 (`paIndexes` ord sort /
no-ord last / other innings skipped; `turnLabel` with ord, without ord, run, unknown code, "•" never present), RF-11
(each of the four rules, precedence outs-before-runs, "1 carrera" singular, 0–0 tie). Browser (orchestrator,
localhost:8001 with Kevin's session, read-only, 360×640 and desktop, light and dark): RF-3/4/5 by surface, RF-6/18
picker, RF-7 three buttons by state, RF-8/9/10 turn numbers, RF-11 question, RF-12/13 keyboard-only, RF-14/15/16 phone
dialog, RF-19–23 labels. Impeccable critique re-run afterwards.

## Risks and open decisions
- "ESTADÍSTICAS" in a 4-column bar at 360 px (≈ 82 px per tab) may clip → T5 measures (D1).
- RF-13 padding is a measured number; the orchestrator confirms it at 360×640 with the toast on.
- T3 removes `.btn-thin` while T7 (wave 2) still emits it → chips with a default value have no outline between the two
  merges; harmless, one deploy.
- RF-9's title is built inline in `paForm`, not a pure function — the NFR lists only RF-1/8/11/17.
- `toast(msg, undo, sticky)` boolean rather than a duration; only `paDelete` passes it.
- `innQuestion` returns `{text, yes}`; the caller maps `yes` to which button is `btn-key`.

## Constitution check
1 Simplicity ✔ (no file, no dependency) · 2 Spec rules ✔ · 3 Logic apart from UI ✔ (four pure functions + reorder) ·
4 Tests ✔ · 5 Data ✔ (nothing stored changes) · 6 Offline ✔ (no new asset, no bump) · 7 Language ✔ (tab label
"Estadísticas") · 8 Ask first ✔ (push is Kevin's).
