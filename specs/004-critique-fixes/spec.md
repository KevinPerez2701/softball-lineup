# Spec 004 — Fixes from the impeccable critique re-run

Status: clarified (clarifier 2026-11-05: 4 blocking + 9 minor, resolved below with Kevin's answers); awaiting G1
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
- US-3: As the manager (or a helper scoring for the first time) I want the results and the stats columns to say what
  they mean.
- US-4: As the manager I want to see at a glance whether the game on screen is saved.
- US-5: As the manager I want to read the names on the field at arm's length, without jersey numbers we don't use.

## Definitions
- **Destructive confirmations** (closed list):
  1. "Borrar juego" (saved games list);
  2. deleting a game's stats (Estadísticas → Juegos);
  3. "Importar respaldo";
  4. "Descartar lo último" (recover card) and the spec 003 RF-10 question "¿Descartar lo último sin guardar?";
  5. leaving the capture sheet with unsaved changes (RF-2);
  6. "Eliminar del equipo" (permanent roster);
  7. "Vaciar asistencia";
  8. "Nuevo juego" and "Abrir" another game while there are unsaved changes;
  9. "Límite de 200 juegos" (saving deletes the oldest games).
  Not included (Kevin): "Reemplazar" in "Este juego cambió en otro dispositivo".
- **Danger style**: the existing `.btn-danger` look (red), never the lime key style.

## Functional requirements (acceptance criteria in EARS)
Data protection
- RF-1: WHEN one of the destructive confirmations opens, THE SYSTEM SHALL style its destructive button with the
  danger style and put the focus on the safe choice ("Cancelar"; "Recuperar" in spec 003's RF-10 question).
- RF-2: WHEN the user closes the capture sheet (Cerrar, Esc or back) with unsaved changes, THE SYSTEM SHALL ask
  "¿Guardar las estadísticas?" with "Guardar y salir" (key style), "Salir sin guardar" (danger style) and
  "Cancelar" (focused). Amends spec 001 RF-11.
- RF-12: WHEN the user picks "Guardar y salir", THE SYSTEM SHALL run the normal stats save and close the sheet only
  if it succeeds; its existing messages (e.g. "Anota al menos un turno", "No se pudo guardar en este navegador")
  keep the sheet open.
- RF-13: IF the RF-2 question is dismissed with Esc or a backdrop tap, THEN THE SYSTEM SHALL keep the capture sheet
  open with its changes, as "Cancelar" does.
- RF-3: WHEN the user changes the result to HR in the result picker (new or edited PA, free or guided mode), THE
  SYSTEM SHALL turn on "Anotó carrera" and set CI to 1 if it is 0 (a higher CI stays); both stay editable.
- RF-14: IF the user then changes the result from HR to another code before "Listo", THEN THE SYSTEM SHALL restore
  "Anotó carrera" and CI to the values they had before HR was picked.
- RF-15: WHEN an existing PA whose code is already HR is opened, THE SYSTEM SHALL show its stored run and CI
  unchanged (old records are not auto-fixed).
- RF-4: THE SYSTEM SHALL leave games whose final score is 0–0 out of the Récord (ganados-perdidos-empatados); they
  still count as played (JJ) and keep their PAs in every player stat.
- RF-16: THE SYSTEM SHALL show a 0–0 game in Estadísticas → Juegos as "Sin marcador" instead of a result.

Clear names
- RF-5: THE SYSTEM SHALL label the sacrifice-fly result "Fly sac." in the result picker and "FS" in the grid cells,
  their accessible labels, the cell's PA list and the player's sequence; the stored code stays `SF`. Amends spec 001
  RF-2's label table.
- RF-6: THE SYSTEM SHALL not offer the `BO` result in the result picker; records that already hold `BO` keep showing
  "BO" and counting as before. (Kevin never used it: "ninguna escribí eso".)
- RF-7: THE SYSTEM SHALL show each game's result in Estadísticas → Juegos in words, "Ganado 6–5", "Perdido 4–6",
  "Empate 2–2" (same wording as `Stats.result`, spec 003 RF-36), instead of "6–5 · G". Amends spec 001 RF-23.
- RF-8: THE SYSTEM SHALL give every column header of the players table a `title` with its full name: JJ "Juegos
  jugados", AP "Apariciones al plato", VB "Veces al bate", H "Hits", 2B "Dobles", 3B "Triples", HR "Jonrones", CA
  "Carreras anotadas", CI "Carreras impulsadas", BB "Bases por bolas", K "Ponches", BR "Bases robadas", AR
  "Atrapado robando", AVE "Promedio de bateo (H ÷ VB)", OBP "Promedio de embasado", SLG "Slugging (bases totales ÷
  VB)", OPS "OBP + SLG".
- RF-17: THE SYSTEM SHALL show under the players table a collapsed `<details>` "Qué significa cada columna" listing
  the RF-8 names.

Saved state
- RF-9: WHILE the working lineup has a linked game and no unsaved changes, THE SYSTEM SHALL show the header save
  button as "Guardado ✓" (accessible name "Guardado") without the key style, at the same height, with no header
  wrap or overflow at 360 px. Amends spec 003 RF-22/RF-23.
- RF-18: WHILE there are unsaved changes or no linked game, THE SYSTEM SHALL show it as "Guardar" with the key style.
  Tapping it in either state does what Guardar does (spec 003 RF-1/RF-2).

Field cards
- RF-10: THE SYSTEM SHALL not show the jersey number on the field cards, nor in their title, on phone and desktop
  (it stays in the roster, the pickers and the stats).
- RF-11: THE SYSTEM SHALL render each field card's player name at 11.5 px on a 360 px wide phone and, IF a name does
  not fit the card at that size, THEN shrink that name's font just enough to fit, down to 10 px (below that, "…");
  the cards keep their size and positions and no two cards overlap with SF, 4F and BD on.

## Non-functional requirements
- Constitution applies: vanilla JS in `index.html` style. Pure logic in `stats.js` with Node tests: the RF-4/RF-16
  record rule, the label maps (RF-5/RF-6/RF-8), and the RF-3/RF-14 HR transition (a small pure helper). No new
  dependency; `sw.js` `VERSION` bumped. `tests/sheet.test.js` (labels) and `tests/views.test.js` (games list shape)
  are updated in the same tasks.
- User-facing text in Latin American Spanish.

## Edge cases
- A 0–0 game still lists in Juegos and opens normally.
- All live records 0–0: "Récord 0-0-0".
- RF-2 when the stats save fails (storage): error toast, sheet stays open.
- RF-18 while the app is fresh (spec 003 RF-8, empty, no link): "Guardar" with the key style.
- Old records with `SF`/`BO` show "FS"/"BO"; nothing is migrated.
- The image, print and ticket show only positions (SF = short fielder there), not results: unchanged.

## Out of scope
- The other critique items: a "seguir con el último juego" card, live scoreboard, two-step result picker,
  substitution taking the batting slot, the Orden badge count, "+" in empty cells, the "Final" tag before the game,
  placeholder contrast, type scale.
- Spelling out the other result codes (1B, 2B, 3B, HR, BB, K, E keep their short labels).
- The player-detail table's column titles.
- The image and the thermal ticket.

## Decisions
- Kevin, 2026-11-05: all five critique issues, data protection first; HR marks the run and CI 1 and a changed
  mind restores them; jersey number off the field cards everywhere ("no se tiene todavía"); leaving the capture
  sheet offers "Guardar y salir"; the extra destructive confirmations 6–9 (not "Reemplazar"); long names shrink
  their own font while the cards stay the same; BO is not a code he uses.
- Orchestrator (confirm at G1): sacrifice fly shows "FS" in cells (fits the 44 px cell with order number and •;
  "F.sac" would not); BO is removed from the picker rather than renamed; the Récord counts only decided and tied
  games with runs.

## Done criteria
- Node tests for RF-3/RF-14 (helper), RF-4/RF-16 and the label maps; browser check at 360 and 1440 px on
  http://127.0.0.1:8000 with the demo harness (never localhost); `node --test 'tests/*.test.js'` green.

## Open questions
- (none)
