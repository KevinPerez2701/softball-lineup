# Plan — Spec 007 critique-rest

No code in this document. Planned 2026-11-06 by sdd-planner (fable); line numbers are of HEAD c4dbadb (b7547ca moved
paForm by ~4 lines: row labels on the left, `.pa-row`).

## Orchestrator review (wins over the rest)
- D1: `.btn-default` keeps its name and 2 px; the thin variant is `.btn-thin` (1 px).
- D2 (RF-12): hide the "Final" tag with `visibility` so the score does not jump at 0–0.
- D3 (swap): when both swapped players are missing from the order, the dragged one first, then the target.
- D4: "Reintentar" (the error gate's only button) keeps its solid lime — it is that surface's one action.
- D5: `cellName` sorts by `ord`; `cellLines` keeps stored order (they agree in practice).
- Kevin wants one deploy for 005 + 006 + 007 (2026-11-06).

## Approach
Seven small pure functions in `stats.js` carry what the NFR wants in node (order rule, cell name, titles, date label,
saved-game sort, record text); `index.html` calls them at the existing choke points. RF-1/2 are one append rule at the
three assignment points (`setPos`, the field drop swap, `btnAutoField`) plus removing the BD eviction in `setPos`; nothing
on load, so RF-3 holds by construction. RF-4/5 restore focus by `data-*` key after the existing re-render. RF-7/8 are
class-name edits plus `.btn-thin`; RF-9 is verified, not changed. No new file, dependency, data shape or `sw.js` bump.

## Contracts (stats.js)
- `Stats.orderAfterAssign(order, ids)` → new array: `order` as is, then each id of `ids` not already in it, in `ids`
  order, deduped; never removes; pure.
- `Stats.cellName(row, inn)` → "<name>, inning <n>" + per PA of the inning sorted by `ord` (no-`ord` PAs after, stored
  order): ", turno <ord>: <label>" (", turno: <label>" without ord), label = CODES `title` || `pick` || raw code,
  + ", anotó carrera" when `run`; then per runner out ", <RO_KINDS pick>" (unknown → kind); none → ", sin turnos".
- `Stats.dateLabel(iso)` → `fmtDate(iso) || "Sin fecha"`.
- `Stats.sheetTitle(game)` → opp: "<team||Equipo> vs <opp>"; opp blank + team: "<team>"; both blank: "Estadísticas";
  + " · dd/mm" when date.
- `Stats.gameTitle(game)` → `dateLabel(date) + (opp ? " · vs " + opp : "")`.
- `Stats.savedByDate(list)` → copy sorted by `state.date` desc, no date last, tie by `at` desc; input untouched.
- `Stats.recordText(g)` → "Récord " + w + "–" + l + "–" + t (U+2013).

## index.html
- RF-1/2: `setPos` ends with `S.order = Stats.orderAfterAssign(S.order, [playerId])` and drops the BD eviction; the
  drop `slot:` branch appends `[fromId, targetId]` (D3); `btnAutoField` appends the ids it placed, in POS_ORDER order.
- RF-4: name cell holds `button.nm[data-pid]` (no own listener; the `tr` click opens, Enter/Space dispatch click); back
  button refocuses `button[data-pid=pid]`; CSS reset like `table.stat thead button` + left align + ellipsis.
- RF-5/7: `chip(label, on, fn, isDefault, key)`: `data-key` ("code:X", "run", "rbi:v", "sb:v", "outs:v"); class
  `on ? (isDefault ? "btn btn-thin" : "btn btn-default") : "btn"`; after `fn(); draw();` focus `[data-key=key]`. Stats
  tabs toggle `btn-default` instead of `btn-key`.
- RF-6: cell `aria-label` = `Stats.cellName(row, n)`. RF-13: `setCapTitle` uses `Stats.sheetTitle`; Juegos uses
  `Stats.gameTitle`. RF-15: `Stats.recordText`.
- RF-8 demotions (solid lime → plain): `teamRosterAll`; `askAlt` when it is a second non-destructive option; inline-edit
  "Guardar"; empty-roster CTA; "Agregar sustituto"; `btnInstall` (no `key`). Survivors: header Guardar, Recuperar,
  Anotar estadísticas, askYes, Agregar (Roster), Guardar estadísticas, Importar, Entrar, Reintentar (D4), Anotar/Otro
  turno, Listo, Sí, Imprimir / PDF, askText Guardar.
- RF-10: `#innPill` text from `S.innings` in `renderInnings`. RF-11: "− Inning", aria-label "Quitar un inning".
  RF-12: `#scTag` visibility from the score in `updateScore` (D2). RF-14: `btnLoad` iterates `Stats.savedByDate(list)`,
  second line `Stats.dateLabel(st.date) + result`.

## Test strategy
`node --test 'tests/*.test.js' < /dev/null`. New `tests/order.test.js` (RF-1/2/3: append, keep, dedup, empty, BD
replaced, swap); `sheet.test.js` (RF-6 cellName cases incl. JS title, run, ord sort, no ord, runner out, unknown code);
`games.test.js` (RF-13 titles, RF-14 dateLabel/savedByDate, RF-15 recordText). Browser (orchestrator, localhost:8000 with
Kevin's session, read-only, 360×640 + desktop): RF-1–3 on the field, RF-4/5 keyboard only, RF-6 accessibility tree,
RF-7–9 surface by surface, RF-10–15 labels.

## Risks
- Six worktrees edit `index.html` in disjoint hunks (map in tasks.md); the orchestrator merges and runs the suite alone.
- Dropping on the BD slot while BD is disabled (pre-existing quirk) appends the player; accepted.

## Constitution check
1 Simplicity ✔ · 2 Spec rules ✔ · 3 Logic apart from UI ✔ (seven pure functions) · 4 Tests ✔ · 5 Data ✔ (display-only
sort) · 6 Offline ✔ · 7 Language ✔ · 8 Ask first ✔ (push is Kevin's).
