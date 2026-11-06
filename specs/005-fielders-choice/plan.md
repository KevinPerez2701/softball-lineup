# Plan — Spec 005 fielders-choice

No code in this document. Planned 2026-11-06 by sdd-planner (fable); line numbers are of HEAD e26a835.

## Orchestrator review (wins over the rest)
- D1 (chips 40 px tall vs the NFR's ≥ 44 px): raise `#paPick .dlg-body .btn` `min-height` to 44 px in T4. One CSS
  value, it is what the NFR says, and the critique's Casey persona asked for it.
- D2 (picker height at 360×640): measured in the T5 demo; if "Listo" needs a scroll that did not exist, rows switch
  to `.chips` (content-width) — one class name.
- D3 (`sw.js` VERSION): stays v7; both changed files are network-first and no file is added.
- Every module maps to an RF; no scope creep found. Constitution check below holds.

## Approach
One new `Stats.CODES` entry (`JS`, with `title`) plus a `group` field on every entry and a small
`Stats.pickRows(codes)` carry RF-1/2/4/6 as data that node tests pin; AVE/OBP/SLG need no change (verified: AB =
PA − BB − SF, hits only from 1B/2B/3B/HR). `paForm.draw` renders `pickRows` as four `.pa-lbl` + `.pa-grid` rows.
RF-7–9 copy the "Campo vaciado" undo pattern (snapshot before + restore in the callback) with the snapshot held in
`cap.undo` and one choke point, `renderCapture()`, that drops it: every sheet change already re-renders through it.

## Modules / files
| Module or file | Responsibility | RFs | New/modified |
|---|---|---|---|
| `stats.js` `CODES`/`PICK_CODES` | JS entry (`pick`/`cell` "JS", `title`), `group` on all 13, `PICK_GROUPS`, `pickRows(codes)` | RF-1, RF-2, RF-5, RF-6 | modified |
| `stats.js` `defaultOuts` | add `"JS"` to the 1-out list | RF-4 | modified |
| `tests/sheet.test.js`, `tests/outs.test.js` | CODES 13/order/title, PICK_CODES 12, cellLabel JS, pickRows, defaultOuts/pickResult/paOuts JS | RF-1, RF-2, RF-4, RF-5, RF-6 | modified |
| `tests/views.test.js` | JS in players/rates/playerGames: AP+VB, no H/BB/K, seq "JS•" | RF-2, RF-3 | modified |
| `index.html` `paForm.draw` | rows from `Stats.pickRows`; JS chip `title`/`aria-label` from `c.title`; chip min-height 44 px (D1) | RF-1, RF-6 | modified |
| `index.html` `paList` + `paDelete` by `paDone`; `renderCapture` first line; `cap.undo` in `openCapture` | delete → snapshot, toast with Deshacer; drop on any later change | RF-7, RF-8, RF-9 | modified |

Not touched: `sw.js`, `firestore.rules`, stats views (cellLabel already feeds cells and the player sequence), guided
mode (shares `paForm`).

## Data model
- Stored record shape unchanged: `pa.code` is a free string; `outs` stored only when ≠ the default (now 1 for JS).
  No migration, no existing `RO` touched (RF-5).
- `Stats.CODES` entries gain `group`; only JS has `title`. Order (13): `1B 2B 3B HR BB K RO FL LI E JS BO SF`.
  `PICK_CODES` = 12 (no BO).
- `cap.undo`: JSON string of `cap.rec.rows` taken before a deletion, or `null`; lives on `cap`, not `cap.rec`, so it
  never reaches the dirty compare nor the saved record.

## Contracts
- JS entry: `{code:"JS", pick:"JS", cell:"JS", group:"Se embasa", title:"Jugada de selección"}`. Groups: 1B 2B 3B HR
  → "Hit"; BB E JS → "Se embasa"; K RO FL LI BO → "Out"; SF → "Sacrificio".
- `Stats.PICK_GROUPS = ["Hit", "Se embasa", "Out", "Sacrificio"]`.
- `Stats.pickRows(codes) → [{label, codes:[entry…]}]`, one row per group in that order, entries in `codes` order.
  `pickRows(PICK_CODES)` = 4/3/4/1; `pickRows(CODES)` puts BO last in "Out".
- `Stats.defaultOuts("JS") === 1`; `cellLabel({code:"JS", run:true}) === "JS•"`.
- `paDelete(msg, mutate)`: `before = JSON.stringify(cap.rec.rows)`; `mutate()`; `paDone()`; `cap.undo = before`;
  `toast(msg, cb)`, `cb` restores only if `cap && cap.undo === before` (`cap.rec.rows = JSON.parse(before);
  renderCapture()`). Both "Borrar" handlers in `paList` go through it ("Turno borrado" / "Out corriendo borrado").
- `renderCapture()` first line: `if(cap.undo){ cap.undo = null; $("toast").classList.remove("on"); }`.

## Algorithms / rules
- RF-6 ordering is data: JS after E so "Se embasa" yields BB, E, JS; BO after JS so "Out" of `CODES` yields K, RO, FL,
  LI, BO (BO wraps to a second grid line, still the end of the Out row).
- RF-7/8: whole-rows snapshot restores the item, its `ord` and every `ord` renumbered in that inning at once; scores
  are not in the snapshot.
- RF-9: every change ends in `renderCapture()` (paDone, guideAdvance, row add/remove, ± Inning, guide close). Inside
  `paDelete`: `paDone()` first (clears a previous pending undo: the last deletion wins), then set `cap.undo`, then
  toast. Close: `cap = null` makes the callback a no-op; the toast lives inside `#capture` and goes with it.
- Undo and `cap.anchor`: restored rows are new objects, so `dueBatter` takes its documented fallback (same batter in
  practice). Accepted.

## Test strategy
Command: `node --test 'tests/*.test.js' < /dev/null`. Tests first in T1/T2.
- RF-1/5/6 (sheet.test.js): 13 codes in order, JS pick/cell, one title, groups, RO unchanged; PICK_CODES 12; new
  "005 RF-6 pickRows" (labels, codes per row, BO last in Out with CODES).
- RF-2: cellLabel JS / "JS•"; playerGames seq "JS•".
- RF-3 (views.test.js): `[1B, JS, BB, SF, JS(run)]` ⇒ pa 5, ab 3, h 1, bb 1, sf 1, r 1, avg .333, obp .400 (2/5: SF counts in the denominator), slg .333;
  playerGames line and team row agree; `rates` direct.
- RF-4 (outs.test.js): defaultOuts JS 1; pickResult → outs 1; paOuts JS 1 / with outs 0 → 0.
- RF-7–9 and RF-1 attributes: browser only (T5 demo).

## Risks
- Picker height at 360 px (D2). A guide toast within 6 s of a deletion is hidden by the next render (rare, accepted).
- Tests pin CODES/PICK_CODES order: T1 amends them in the same commit.
- Post-deploy: Elias Colmenarez's 5th-inning PA (05/11) converted by hand — a STATUS line, not a task gate.

## Constitution check
1 Simplicity ✔ · 2 Spec rules ✔ (every change maps to RF-1–9) · 3 Logic apart from UI ✔ · 4 Tests as the gate ✔ ·
5 Data ✔ (no shape change, no conversion) · 6 Offline ✔ (no new file, network-first) · 7 Language ✔ · 8 Ask first ✔
(no dependency, rules or auth; Kevin approves the push).
