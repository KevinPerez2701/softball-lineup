# Spec 004 — Fixes from the impeccable critique re-run

Status: draft
Created: 2026-11-05

## Context and goal
The impeccable critique re-run after spec 003 scored the app 27/40 (snapshot
`.impeccable/critique/2026-11-05T18-19-42Z__index-html.md`, git-excluded). Consistency and error prevention stayed
at 2/4. Kevin chose to fix all five priority issues, data protection first: confirmations that delete or replace
data look like the main action and get the focus; stat entry accepts a HR with no run and counts 0–0 games as
ties; some abbreviations clash (SF, E) or are unexplained (BO, the stats columns); the save button does not show
whether the game is saved; field-card names are small on phone, and the jersey number shows on the field although
the team does not have numbers yet.

## Users / actors
- The signed-in manager (Kevin), on phone in the dugout and on desktop after the game.

## User stories
- US-1: As the manager I don't want one stray tap or Enter to delete or replace data.
- US-2: As the manager I want the stats to come out right without remembering to mark the obvious (a HR scores).
- US-3: As the manager (or a helper scoring for the first time) I want every code and column to say what it means.
- US-4: As the manager I want to see at a glance whether the game on screen is saved.
- US-5: As the manager I want to read the names on the field at arm's length, without jersey numbers we don't use.

## Definitions
- **Destructive confirmation**: a confirmation whose "yes" deletes or replaces data: "Borrar juego" (saved games
  list), deleting a game's stats (Estadísticas → Juegos), "Importar respaldo", "Descartar lo último" (recover card
  and the RF-10 question of spec 003), and leaving the capture sheet with unsaved changes.
- **Danger style**: the existing `.btn-danger` look (red), never the lime key style.

## Functional requirements (acceptance criteria in EARS)
Data protection
- RF-1: WHEN a destructive confirmation opens, THE SYSTEM SHALL style its destructive button with the danger style
  and put the focus on the non-destructive choice ("Cancelar", or "Recuperar" in spec 003's RF-10 question).
- RF-2: WHEN the user closes the capture sheet (Cerrar, Esc or back) with unsaved changes, THE SYSTEM SHALL ask
  "¿Guardar las estadísticas?" with "Guardar y salir" (key style), "Salir sin guardar" (danger style) and
  "Cancelar" (focused); "Guardar y salir" runs the normal stats save and closes only if it succeeds (its existing
  messages, e.g. "Anota al menos un turno", keep the sheet open).
- RF-3: WHEN the user picks HR in the result picker, THE SYSTEM SHALL mark "Anotó carrera" and set CI to 1 if it was
  0 (a higher CI stays), both still editable before "Listo".
- RF-4: THE SYSTEM SHALL leave games whose final score is 0–0 out of the Récord (ganados-perdidos-empatados) and out
  of the runs for/against totals, and show them in Estadísticas → Juegos as "Sin marcador".

Clear names
- RF-5: THE SYSTEM SHALL label the sacrifice-fly result "Fly sac." in the result picker and "F.sac" in the grid cells
  and the player's sequence; the stored code stays `SF` (records of specs 001–003 unchanged).
- RF-6: THE SYSTEM SHALL label the `BO` result with its full name in the picker. [NEEDS CLARIFICATION: what BO means]
- RF-7: THE SYSTEM SHALL show each game's result in Estadísticas → Juegos in words: "Ganado 6–5", "Perdido 4–6",
  "Empate 2–2" (same wording as the saved games list, spec 003 RF-36), instead of "6–5 · G".
- RF-8: THE SYSTEM SHALL give every column header of the players table a `title` with its full name (e.g. "VB" →
  "Veces al bate") and show under the table a collapsed `<details>` "Qué significa cada columna" listing all of them.

Saved state
- RF-9: WHILE the working lineup has a linked game and no unsaved changes, THE SYSTEM SHALL show the header save
  button as "Guardado ✓" without the key style; otherwise it SHALL show "Guardar" with the key style. Tapping it
  in either state does what Guardar does today (spec 003 RF-1/RF-2).

Field cards
- RF-10: THE SYSTEM SHALL not show the jersey number on the field cards, on phone and desktop (the number stays in
  the roster, the pickers and the stats).
- RF-11: THE SYSTEM SHALL render the field cards' player name at 11.5 px or more on a 360 px wide phone, with no two
  cards overlapping with SF, 4F and BD on.

## Non-functional requirements
- Constitution applies: vanilla JS in `index.html` style; the RF-4 record rule and any label maps are pure logic in
  `stats.js` with Node tests; no new dependency; `sw.js` `VERSION` bumped.
- User-facing text in Latin American Spanish.

## Edge cases
- A 0–0 game still lists in Juegos and opens normally; only the record and the run totals skip it.
- RF-3 on editing an existing HR that has CI 3: CI stays 3, run stays marked.
- RF-2 when the stats save fails (storage): error toast, sheet stays open.
- RF-9 while the app is fresh (spec 003 RF-8, empty, no link): "Guardar" with the key style.
- Old records with `SF`/`BO` codes show the new labels; nothing is migrated.

## Out of scope
- The other critique items: a "seguir con el último juego" card, live scoreboard, two-step result picker,
  substitution taking the batting slot, the Orden badge count, "+" in empty cells, the "Final" tag before the game,
  placeholder contrast, type scale.
- The image and the thermal ticket (they keep their current text).

## Decisions
- Kevin, 2026-11-05: all five critique issues, data protection first; HR marks the run and CI 1; jersey number off
  the field cards on phone and desktop ("no se tiene todavía"); leaving the capture sheet offers "Guardar y salir".
- Orchestrator (confirm at G1): grid label for the sacrifice fly is "F.sac"; Récord skips 0–0 games entirely
  (record and run totals); the RF-8 key is a collapsed `<details>` under the players table.

## Done criteria
- Node tests for RF-4 and the label maps; browser check at 360 and 1440 px on http://127.0.0.1:8000 with the demo
  harness (never localhost: it may carry the real Firebase session); `node --test 'tests/*.test.js'` green.

## Open questions
- [NEEDS CLARIFICATION] RF-6: what does "BO" stand for in your scorebook (it counts as 1 out today)?
