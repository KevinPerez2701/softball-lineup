# Plan — Spec 002 inning-capture

No code in this document. Decisions only. Every decision points at the RF it serves.
Planned 2026-10-23 by sdd-planner (fable); reviewed by the orchestrator. Extends `specs/001-game-stats/plan.md`.

## Approach
Four optional fields on the data already stored (`pa.ord`, `pa.outs`, `row.ro[]`, `row.sub`), no new document, no
sync/merge/rules change. All new logic is pure functions in `stats.js` (outs, slots, due batter, ord, cell lines)
plus small edits to the spec 001 readers (`minInnings`, `players`, `playerGames`; `hasPA` unchanged). The guided
mode is a state object (`guide`) plus a few steps rendered inside the existing `#paPick` dialog, reusing
`paForm`/`paSubs` with a "done" callback. "¿Hubo otro inning?" is a picker step too (not `askConfirm`: its "No" is
hard-wired to "Cancelar", and closing the picker must act as "Terminar"). The free-cell path (`paForm`) is the same
code the guided mode uses, so RF-6/RF-11 come for free.

## Modules / files
| Module or file | Responsibility | RFs | New/mod |
|---|---|---|---|
| `stats.js` "hoja" section | `RO_KINDS`, `roLabel`, `defaultOuts`, `paOuts`, `inningOuts`, `outsCheck`, `openInning`, `cellLines`, `rowEmpty`; `minInnings` counts `ro` | 1, 4, 6, 7, 8, 9, 12, 16, 17 | mod |
| `stats.js` new "modo guiado" section | `slots`, `activeRow`, `dueBatter`, `nextOrd`, `renumberOrd` | 3, 5, 10, 11, 19 | mod |
| `stats.js` "jugadores"/"juegos" | `players` adds `cs`, counts rows with `ro`; `playerGames` adds `ro` lines/labels | 13, 14, 18 | mod |
| `tests/outs.test.js` | outs, inning outs, header check, open inning, labels, cell lines, rowEmpty | 1, 4, 6, 8, 9, 12, 16, 17 | new |
| `tests/guide.test.js` | slots, due batter, ord | 3, 5, 10, 11, 19 | new |
| `tests/sheet.test.js`, `tests/views.test.js` | `minInnings` with `ro`; `cs`, ro-only player, seq with ro; spec 001 fixtures unchanged | 12, 13, 14, 17, 18, 21 | mod |
| `index.html` `paForm`, `paList`, `onCellTap`, new `roPick` | outs chips; `ord` on add; renumber on delete; ro list + "Borrar"; "Out corriendo" in the empty-cell picker; `done` callback | 6, 10, 11, 16 | mod |
| `index.html` `renderCapture`, `refreshCheck`, `onRowMenu`, capture CSS | cell lines with `ord`/ro; outs line per header; row removal blocked by ro | 8, 9, 17 | mod |
| `index.html` new "modo guiado" block after `paSubs`, `#capture` head, `paSubs`, `closeCapture` | `capGuide` button, `guide` state, `guideStart/Show/Advance/Ask`, "Otro bateador", sub with `sub:true`, `#paPick` `close` handler | 1, 2, 3, 4, 5, 7, 15, 19, 20 | mod |
| `index.html` `STAT_COLS` | `["cs","AR",1]` after `["sb","BR",1]` | 14, 18 | mod |
| `sw.js` | `VERSION` `v4` → `v5` (no new asset) | NFR | mod |

## Data model
- **PA** `{inn, code, run, rbi, sb, ord?, outs?}`. `ord`: integer ≥ 1, written on every PA added from this version
  on (guided or free), never edited, renumbered on delete (RF-3/10/11). `outs`: 0–3, present only when
  ≠ `defaultOuts(code)`; removed on edit when it equals the default (RF-6/12).
- **Row** `{pid, num, name, pos, pas, ro?, sub?}`. `ro`: `[{inn, kind}]`, `kind ∈ {"CS","PO","OB"}`, entry order;
  absent until the first runner out (RF-7/16). `sub: true` on rows inserted by "Agregar sustituto" from this
  version on, from the guided mode or the row menu (same code path) (RF-5).
- **Record, markers, `users/{uid}/data/stats`, merge, `S.statsId`**: unchanged. `cap` gains `anchor` (a PA object
  of `cap.rec`, or `null`), `null` in `openCapture`; not part of `cap.opened` (RF-15/20).
- **Readers tolerate absence** (RF-12): `row.ro || []`, `pa.outs === undefined → default`, `!pa.ord → no number`,
  `!row.sub → own slot`.
- **Old app versions on other devices**: safe — they edit PAs in place (unknown keys survive), splice rows/PAs,
  JSON-roundtrip records, ignore `ro`/`sub`. Accepted cosmetic effects: an old-app delete leaves an `ord` gap; an
  old-app edit of an `outs:2` PA to a hit keeps `outs:2`; an old-app "− Inning" may drop a column holding only a
  runner out, which the new app's `fit` raises back (`minInnings` counts `ro`).
- **Must NOT change**: `current/team/saved`, `SYNC`/`KEY_OF`, `merge`, `putMerged`, `firestore.rules`, `hasPA`
  (RF-21), `fit` (already delegates to `minInnings`).

## Contracts (`Stats.*`, pure, no clock; `rec` mutated only where stated)
- `RO_KINDS: [{kind, pick, cell}]` = CS "Atrapado robando"/"AR", PO "Sorprendido en base"/"Sor", OB "Out corriendo
  las bases"/"OC"; `roLabel(kind)` → cell label (RF-7/9/13/16).
- `defaultOuts(code)` → 1 for K/RO/FL/LI/SF/BO, 0 otherwise (incl. `""`); `paOuts(pa)` → `pa.outs` if defined else
  default (RF-6).
- `inningOuts(rec, inn)` → Σ `paOuts` + ro count for `inn` (RF-4/8).
- `outsCheck(rec)` → `[{outs, warn}]` per column 1..`innings`; `warn` = `outs !== 3` and the column is before the
  last column holding a PA or ro (RF-8).
- `openInning(rec)` → first `inn` in 1..`innings` with outs < 3, else `innings + 1` (RF-1).
- `cellLines(row, inn)` → `[{ord: n|null, text}]`: PAs of `inn` in entry order (`text = cellLabel`), then ro of
  `inn` (`text = roLabel`, `ord: null`) (RF-9/12/16).
- `rowEmpty(row)` → no PA and no ro (RF-17). `minInnings(rec)` → `max(3, highest inn of a PA or ro)` (RF-17).
- `slots(rows)` → `[[rowIdx…]]`: a non-`sub` row plus the `sub` rows directly below; a leading `sub` row starts its
  own slot. `activeRow(rows, slot)` → highest index in the slot with ≥ 1 PA, else `slot[0]`.
- `dueBatter(rec, inn, anchor)` → row index or `null`. Anchor = PA object found by identity in `rec.rows` (not found
  ⇒ fallback: row of the highest `ord` in the latest inning holding a PA with `ord`; none ⇒ first slot). Candidate =
  active row of the slot after the anchor's slot (wrap). RF-19: while the candidate has 2 PAs in `inn`, next slot;
  after a full cycle `null` (RF-3/5/15/19).
- `nextOrd(rec, inn)` → (PAs with `ord` in `inn`) + 1 (RF-3/11). `renumberOrd(rec, inn, removedOrd)` mutates:
  `ord > removedOrd` in `inn` → `ord − 1` (RF-10).
- `players(entries, team)` rows gain `cs` (ro of kind CS); a row counts (`g++`, label) when it has a PA or an ro;
  `team.cs` summed (RF-14/18). `playerGames(entries, pid)` includes ro-only rows (`ab` 0); `seq` per inning: PAs in
  entry order, then that inning's ro labels (RF-13/18).
- index.html: `paForm(ri, inn, idx, done)` (`done` defaults to `paDone`; receives the PA on confirm);
  `paSubs(ri, done)` (inserts `{…, sub:true, pas:[]}` at `ri+1`, calls `done(ri+1)`); `roPick(ri|null, inn, done)`
  (runner step when `ri === null`, then kind step, pushes `{inn, kind}` to `row.ro`); `guideStart()`,
  `guideShow()`, `guideAdvance()`, `guideAsk()`.

## Algorithms / rules
- **Guided state**: `var guide = null | {inn, batter}`; `batter` = row override from "Otro bateador"/new sub for
  the next PA only. `cap.anchor` outlives `guide` (RF-15).
- **Start (RF-1)**: `inn = Stats.openInning(cap.rec)`; `inn > innings` ⇒ `guide = {inn: innings, batter:null}` then
  `guideAsk()`; else `guideShow()`; `$("paPick").showModal()` once.
- **Show (RF-2/19)**: `ri = guide.batter ?? Stats.dueBatter(cap.rec, guide.inn, cap.anchor)`; `null` ⇒ close the
  picker (ends mode). Title "Inning <inn> · <outs> out · Al bate: <num · name>"; body `paForm(ri, inn, null, onPA)`
  with "Listo", "Cancelar" (closes ⇒ Terminar), "Out corriendo" and, only in guided mode, "Otro bateador" and
  "Terminar".
- **PA confirmed (RF-3)**: `paForm` pushes `{…, ord: nextOrd}`; `onPA(pa)` ⇒ `cap.anchor = pa; guide.batter = null;
  guideAdvance()`.
- **Advance (RF-4)**: `renderCapture()`; if `inningOuts(rec, guide.inn) >= 3` ⇒ `guide.inn++`; if
  `guide.inn > innings` ⇒ `guideAsk()` else `guideShow()`.
- **Ask (RF-4)** (as built in T6: at 12 innings the picker closes and a toast "Máximo 12 innings" shows in `#capture`): title "¿Hubo otro inning?", "Sí"/"No". "Sí" with `innings < 12` ⇒ `innings++`, `Stats.fit`,
  `guideShow()`; "No", or 12 ⇒ close the picker (no toast: toasts land in `#capture` under the modal).
- **Otro bateador (RF-5)**: list rows with < 2 PAs in the inning (`num · name`) + "Agregar sustituto"; row ⇒
  `guide.batter = i; guideShow()`; sub ⇒ `paSubs(dueRi, function(newRi){ guide.batter = newRi; guideShow(); })`,
  `dueRi` = the computed due batter.
- **Out corriendo (RF-7/16)**: guided ⇒ `roPick(null, guide.inn, guideAdvance)` (`guide.batter` kept); free empty
  cell ⇒ `roPick(ri, inn, paDone)` (kind only).
- **End (RF-15/20)**: `#paPick` `close` event: `if(guide){ guide = null; renderCapture(); }` — covers "Terminar",
  "Cancelar", the close button, Esc. `closeCapture()` also sets `guide = null`; `cap = null` drops the anchor.
- **Free picker (RF-6/10/11/16)**: `f.outs` = `paOuts(src)` when editing else 0; a code chip sets
  `f.outs = defaultOuts(code)`; chips "Outs en la jugada" 0–3; confirm writes `outs` only when ≠ default, deletes it
  otherwise (unchanged PA ⇒ identical JSON, RF-12); new PA gets `ord`. Delete in `paList`: splice, then
  `renumberOrd` if it had `ord`. `onCellTap` opens `paList` when the cell has a PA or an ro; `paList` appends ro
  items (label + "Borrar").
- **Grid (RF-8/9/17)**: one `div` per `cellLines` entry (`<small>ord</small>` + text); header `th` gets a second
  `<small>` ("<n> out" / "⚠ <n> out") filled by `refreshCheck` from `outsCheck` — `refreshCheck` must address the
  run-diff `<small>` explicitly, not via `lastChild`. Row menu offers "Quitar fila" only when `rowEmpty(row)`;
  `capDelInn` unchanged (uses `minInnings`).
- **Players (RF-14/18)**: one `STAT_COLS` entry; `renderPlayerDetail` unchanged (`seq` carries the labels).

## Test strategy
Command `node --test 'tests/*.test.js'`; fixtures inline.
- RF-6 `defaultOuts`/`paOuts`; RF-4/8 `inningOuts`/`outsCheck` (`[3,2,3,1,0]` with last entry in inning 4 ⇒ warn
  only inning 2; 4 outs ⇒ warn; empty ⇒ no warn; walk-off last inning ⇒ no warn); RF-1 `openInning`; RF-9/16
  `cellLines`; RF-7 labels; RF-17 `minInnings` with ro, `rowEmpty`; RF-21 `hasPA` with ro only ⇒ false.
- RF-5/19 `slots` (`[A, B(sub), C, D(sub), E(sub), F]` ⇒ `[[0,1],[2,3,4],[5]]`; old sub without flag ⇒ own slot;
  active row); RF-3/5/19 `dueBatter` (no anchor ⇒ first slot; wrap; deleted anchor ⇒ ord fallback; sub with PA bats;
  2-PA candidate skipped; all full ⇒ `null`); RF-10/11 `nextOrd`, `renumberOrd`.
- RF-13/14/18 `players`/`playerGames`: `cs` per player and team; ro-only player listed with `pa/ab` 0, `g` 1; `seq`
  "K · AR · 1B"; PO/OB not in `cs`; ro never in `ab/h`. RF-12: spec 001 fixtures keep every assertion.
- Manual (phone + desktop) for RF-1/2/3/4/5/7/8/9/15/16/17/19/20 and the AR column, in the final demo task.

## Risks
- Toasts are invisible while `#paPick` is open → guided mode uses picker steps, never toasts; the 12-inning cap ends
  the mode silently.
- `refreshCheck` uses `lastChild` for the run-diff `<small>` → must be indexed explicitly when the outs line is
  added.
- `dueBatter` returns `null` when every slot has 2 PAs in the inning → the mode ends; nothing written.
- Three-line cells make rows taller; accepted.
- "Otro bateador" lists only rows with < 2 PAs in the inning (keeps spec 001 RF-28).
- "Agregar sustituto" from "Otro bateador" goes under the computed due batter, not the chosen row (assumption).
- `players` label/`g` now also consider ro-only records (consistent with RF-18; slight widening of 001 RF-21).

## Constitution check
1. Simplicity — complies: no deps, two new test files, ES5, reuse of `paForm`/`paSubs`/`#paPick`.
2. Spec rules — complies: every module maps to RF-1…21; assumptions flagged above.
3. Logic apart from UI — complies: outs, slots, due batter (anchor as parameter), ord, cell lines, counts in `stats.js`.
4. Tests as the gate — complies.
5. Data — complies: optional fields only, old records load unchanged, nothing deleted, merge untouched.
6. Offline first — complies: `sw.js` v5.
7. Language — complies.
8. Ask first — complies: no deps, no rules change, no push.
