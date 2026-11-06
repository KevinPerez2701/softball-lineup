# Plan — Spec 006 stats-phone

No code in this document. Planned 2026-11-06 by sdd-planner (fable); line numbers are of HEAD 66daa17.

## Orchestrator review (wins over the rest)
- D1 accepted: the detail's Total rates come from the `Stats.players` row `renderPlayerDetail` already fetches;
  `playerGames.total` and its tests stay unchanged. The spec NFR was reworded to match.
- D2: no CSS change; the Total row keeps its trailing empty "Turnos" cell, so `td:last-child` still points at Turnos.
  Settled in the browser demo.
- Runs in parallel with spec 005 in its own worktree, branched after 005 wave 1 is merged (both touch
  `tests/sheet.test.js`).

## Approach
Move the players-table column list from `index.html` to `stats.js` as `Stats.STAT_COLS` (same `[key, label, int]`
shape, RF-1 order) and let the four consumers (header, rows, Equipo, key) read it; sorting and formats untouched
(RF-2). RF-3: the detail's Total row takes `avg/obp/ops` from the player's `Stats.players` row (`p`), formatted with
`Stats.fmt`: equal to the table by construction, no counting logic duplicated. No new file, dependency or `sw.js` bump.

## Modules / files
| Module or file | Responsibility | RFs | New/mod |
|---|---|---|---|
| `stats.js` after `COL_TITLES` | `Stats.STAT_COLS`: 17 `[key, label, int]` in RF-1 order | 1, 2 | mod |
| `index.html` `STAT_COLS` and its uses in `renderStatsPlayers` | delete the local list; read `Stats.STAT_COLS` | 1, 2 | mod |
| `index.html` `renderPlayerDetail` | AVE/OBP/OPS between K and Turnos, `title` from `COL_TITLES`, empty per-game cells, Total from `p` | 3 | mod |
| `tests/sheet.test.js` (after the COL_TITLES test) | RF-1 labels, keys, int flags, labels ⊂ COL_TITLES | 1 | mod |
| `tests/views.test.js` (append) | RF-3: detail pids = players pids; edge-case rates | 3 | mod |

## Data model
Nothing stored changes. `Stats.players` rows and `Stats.playerGames` unchanged. Must NOT change: `COL_TITLES`,
`rates`, `fmt`, `statCell`, `sortPlayers`, the default sort `{key:"avg", desc:true}`.

## Contracts
- `Stats.STAT_COLS` = `["avg","AVE"], ["obp","OBP"], ["slg","SLG"], ["ops","OPS"], ["g","JJ",1], ["pa","AP",1],
  ["ab","VB",1], ["h","H",1], ["b2","2B",1], ["b3","3B",1], ["hr","HR",1], ["r","CA",1], ["rbi","CI",1], ["bb","BB",1],
  ["k","K",1], ["sb","BR",1], ["cs","AR",1]` (rates have no int flag ⇒ `Stats.fmt`). "Jugador" stays prepended by the
  header code.
- `renderPlayerDetail`: columns Fecha, Rival, VB, H, CA, CI, BB, K, AVE, OBP, OPS, Turnos; rate headers get
  `title = Stats.COL_TITLES[label]`; per-game rows three empty `td`; Total row `Stats.fmt(p.avg/obp/ops)`, "—" if `p`
  is missing; the trailing Turnos `td` stays last.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null`.
- RF-1 (sheet.test.js): labels deep-equal the RF-1 list (17, no "Jugador"); every label a key of `COL_TITLES`; keys are
  `players` row keys; exactly the four rates lack the int flag. RF-2: existing sortPlayers tests.
- RF-3 (views.test.js): pids with `playerGames` lines = `players` rows; walks-only ⇒ avg null, obp 1, ops null
  ("—", "1.000", "—"); SF-only ⇒ obp 0 (".000"); runner-outs-only ⇒ all "—".
- Browser (final demo, 360×640 and desktop): header/Equipo/key in RF-1 order; AVE visible at scroll 0 with the sticky
  name column; default sort AVE ▼ and sorting as before; detail columns between K and Turnos with titles, empty
  per-game cells, Total equal to the table, OPS right-aligned and Turnos left; edge-case players.

## Risks
- AVE fit at 360 px estimated (≈163 + 60 of ≈300 px); if not, narrow the first column only inside `#statsView`.
- Merge with 005: disjoint regions; the orchestrator merges and runs the full suite.

## Constitution check
1 Simplicity ✔ · 2 Spec rules ✔ · 3 Logic apart from UI ✔ · 4 Tests ✔ · 5 Data ✔ · 6 Offline ✔ · 7 Language ✔ ·
8 Ask first ✔.
