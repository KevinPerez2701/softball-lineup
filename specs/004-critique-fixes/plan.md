# Plan — Spec 004 critique-fixes

No code in this document. Decisions only. Planned 2026-11-05 by sdd-planner (fable), reviewed by the orchestrator
("Orchestrator review" at the end wins over the body).

## Approach
Three pure additions in `stats.js` (HR transition helper, 0–0 record rule with result text, label maps) carry every
rule the spec wants tested; `index.html` only reads them. The `#ask` dialog gets one optional `danger` argument on
`askConfirm`/`askChoice` (red button + focus on the safe choice) and the existing calls pass it; RF-2 is `askChoice`
in `tryCloseCapture` reusing `saveCapture`. Header, field cards and stats tables are small edits to existing render
functions; the only new function is `fitSlotNames()` (RF-11). No new file, dialog or dependency.

## Modules / files
| Module or file | Responsibility | RFs | New/mod |
|---|---|---|---|
| `stats.js` "hoja" (l.7-20) | `CODES` SF → pick "Fly sac."/cell "FS"; BO `legacy:true`; `PICK_CODES`; `COL_TITLES` | 5, 6, 8, 17 | mod |
| `stats.js` `Stats.games` (l.315) | 0–0 ⇒ `result ""`, not counted; `text` per game | 4, 7, 16 | mod |
| `stats.js` `Stats.pickResult(f, code)` | HR transition: set run/CI on HR, restore on leaving | 3, 14, 15 | mod |
| `tests/sheet.test.js` | CODES/PICK_CODES/COL_TITLES; `pickResult` | 3, 5, 6, 8, 14, 15 | mod |
| `tests/views.test.js` | games list `result`/`text`, 0–0 rule; seq "HR• · FS · …" (l.194) | 4, 5, 7, 16 | mod |
| `index.html` `#ask` (l.1725-1767, handlers l.3441-3458, CSS l.197) | `danger` on `askConfirm`/`askChoice`; `.btn-danger` resting look | 1 | mod |
| `index.html` confirm call sites (l.1834, 1844, 2365, 2401, 3129, 3163, 3230, 3235, 3427) | pass `danger`; RF-10 keeps `locked` | 1 | mod |
| `index.html` `tryCloseCapture` (l.3090-3093) | `askChoice` Guardar y salir / Salir sin guardar / Cancelar | 2, 12, 13 | mod |
| `index.html` `paForm.draw` (l.2841-2844) | `Stats.PICK_CODES` + `Stats.pickResult` | 3, 6, 14, 15 | mod |
| `index.html` `renderStatsGames` (l.3263-3276) + its delete confirm (l.3288) | `x.text`; danger confirm | 7, 16, 1 | mod |
| `index.html` `renderStatsPlayers` (l.3307-3345) | `th.title` from `COL_TITLES`; `<details>` key | 8, 17 | mod |
| `index.html` `renderHeader` (l.1654-1670) + phone CSS l.684 | `#btnSave` per saved state, same size | 9, 18 | mod |
| `index.html` `renderField` (l.1916-1942), slot CSS, `setTab` (l.3862), `fitSlotNames()` | no jersey; 11.5 px names, per-name shrink | 10, 11 | mod |
| `sw.js` | `VERSION` v6 → v7 | NFR | mod |

## Data model
- Nothing stored changes; PA codes stay `SF`/`BO`; no migration.
- Transient: picker form `f` gains `hrPrev: {run, rbi}` while in HR picked in this form session (RF-14).
- `Stats.games(...).list[i]` gains `text`; `result` is `""` for 0–0 (was "T"). Consumers: `renderStatsGames`, tests.
- Must NOT change: `Stats.result`, `Stats.cellLabel` signature, `CODES` length/order, `askLocked` behavior (003 R1).

## Contracts
- `Stats.CODES`: SF `{pick:"Fly sac.", cell:"FS"}`; BO `{pick:"BO", cell:"BO", legacy:true}`. `Stats.PICK_CODES` =
  CODES without legacy (11). `cellLabel` unchanged ⇒ cells, PA list, cell aria-label and player seq say "FS".
- `Stats.COL_TITLES` = the 17 names of spec RF-8, keyed by the STAT_COLS label.
- `Stats.games(entries)`: `us === 0 && them === 0` ⇒ `result ""`, `text "Sin marcador"`, no w/l/t increment, still
  listed; else W/L/T and `text = Stats.result(g)`.
- `Stats.pickResult(f, code)` → mutates/returns `f`: code change ⇒ `f.code = code; f.outs = Stats.defaultOuts(code)`.
  Entering HR (from non-HR): `f.hrPrev = {run, rbi}; f.run = true; if(!f.rbi) f.rbi = 1`. Leaving HR with `hrPrev`:
  restore, delete `hrPrev`. Leaving HR without `hrPrev` (opened as HR) or HR → HR: no run/CI change.
- `askConfirm(title, msg, yesLabel, cb, danger)`: danger ⇒ `#askYes` `btn btn-sm btn-danger`, focus `#askNo`.
  `askChoice(title, msg, yesLabel, altLabel, cb, locked, danger)`, `danger ∈ {"yes","alt"}`: that button red, the
  other `btn-key`; focus `#askNo` when shown, else the non-danger button.
- `tryCloseCapture()`: dirty ⇒ `askChoice("¿Guardar las estadísticas?", "Hay cambios sin guardar.", "Guardar y
  salir", "Salir sin guardar", cb, false, "alt")`; yes ⇒ `saveCapture()`; alt ⇒ `closeCapture()`. Esc/backdrop on
  `#ask` already close only `#ask` (RF-13).
- `fitSlotNames()`: for each visible `.slot-name`, clear inline size, step down 0.5 px while
  `scrollWidth > clientWidth` and size > 10. Called at the end of `renderField()`, in `setTab()`, on resize (rAF
  coalesced) and on `document.fonts.ready`.

## Algorithms / rules
- RF-9/18: `saved = g && !dirty`; saved ⇒ "Guardado ✓", `aria-label="Guardado"`, `btn btn-ghost btn-sm`; else
  "Guardar", key. Phone CSS l.684 selector `.tools .btn-key,#btnSave` so both states have the same size.
- RF-10: drop the `slot-jersey` span and the `· #num` title suffix; delete `.slot-jersey` rules.
- RF-11: ≤680 `.slot-name{font-size:max(11.5px,3cqw)}`; remove the ≤420 override; re-check P/DH/C spacing.
- RF-7/16: games list text = `x.text`. RF-17: `details.hint` "Qué significa cada columna", one line per column.

## Test strategy
`node --test 'tests/*.test.js'`. Node tests for CODES/PICK_CODES/COL_TITLES, `Stats.games` text/0–0 rule (incl. JJ
unaffected, all-0–0 ⇒ 0-0-0), `pickResult` (new→HR, rbi 3 stays, HR→K restores, edits while HR then leave ⇒ pre-HR
values, opened-as-HR → 1B untouched, HR→HR no-op, outs reset). Manual at 360/1440 px on http://127.0.0.1:8000 with the
demo harness: every confirm in the closed list, capture close outcomes, HR free/guided, header states, field cards
with SF/4F/BD and a 14-char name, Juegos text, column titles and key.

## Risks
- Header at 360 with "Guardado ✓" (~25 px wider) → brand ellipsis absorbs it; check by hand.
- Taller cards at 11.5 px vs P/DH/C spacing → re-tune `my`, timebox 20 min.
- `fitSlotNames` on a hidden phone tab → `clientWidth === 0` guard + `setTab` call.
- `askChoice` 7th positional argument → one doc comment.

## Constitution check
1 Simplicity ✔ · 2 Spec rules ✔ · 3 Logic apart (stats.js helpers) ✔ · 4 Tests ✔ · 5 Data (no shape change) ✔ ·
6 Offline (VERSION v7) ✔ · 7 Language ✔ · 8 Ask first ✔ (D1 below).

## Orchestrator review (2026-11-05) — wins over the body
- D1: `.btn-danger` gets a resting red look app-wide (`color` and `border-color` `var(--bad)`), so every delete
  button reads as dangerous, consistent with RF-1.
- Parallel waves as in tasks.md (Kevin: work in parallel). Wave 1: A (stats.js) ‖ B (dialogs) ‖ E (header) ‖ F (field)
  in worktrees outside the repo; Wave 2: C (picker) ‖ D (stats views) after A; Wave 3 orchestrator.
