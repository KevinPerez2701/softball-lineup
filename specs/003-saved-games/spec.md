# Spec 003 — Saved lineups as games

Status: clarify — RF-1–17 clarified (7 blocking + 9 minor resolved); design RF-18–34 added 2026-11-05 after the impeccable critique, clarifier pass on them pending; then G1
Created: 2026-11-05

## Context and goal
Kevin plays in the games, so he does not score live: he builds the lineup before the game and, after it, fixes
the lineup (people who did not show up, position changes) and transcribes the stats. Today "Guardar" always adds a
new entry to "Alineaciones guardadas", so a lineup saved before the game and saved again after the changes ends up
twice ("MSO vs Call · 2026-10-29" ×2), and the app reopens on whatever was last on screen. This spec makes each
saved entry one game that is opened, edited and saved in place, and makes the app start empty.

## Users / actors
- The signed-in manager (Kevin), on phone or desktop, before and after a game.

## User stories
- US-1: As the manager I want "Guardar" on a game I opened to update that game, not create a copy.
- US-2: As the manager I want to open a saved game after it was played, change its lineup and its stats, and keep
  one entry per game.
- US-3: As the manager I want the app to open empty, and still get back a lineup I did not save, on either device.
- US-4: As the manager I want to reuse an old game's lineup for a new game without touching the old one.

## Definitions
- **Working lineup**: what the main screen shows and edits (`current`, still shared between devices as today).
- **Saved game**: one entry of "Alineaciones guardadas" (`saved`): `{id, name, at, state}`; `state` is a working
  lineup.
- **Linked game**: the saved game the working lineup was opened from or last saved to. The working lineup keeps the
  link (the game's `id` and the `at` it had when opened or last saved here). A link whose `id` is not in `saved`
  counts as no linked game. A lineup started empty or with "Nuevo" has none.
- **Compared fields**: `team`, `opp`, `home`, `date`, `roster` (player ids, in order), `assign`, `order`, `dh`,
  `enabledSF`, `enabled4F`, `enabledDH`, `innings`, `us`, `them`, `statsId`. Both sides are normalized as on open
  (missing fields filled, roster names synced with the permanent roster) before comparing. `at` and key order
  never count.
- **Empty**: every compared field equals `blankState()`, ignoring `date` and `roster`. So the state right after
  "Nuevo" (players of the game kept) is empty.
- **Unsaved changes**: the working lineup has a linked game and differs from its `state` in a compared field, or it
  has no linked game and is not empty.

## Functional requirements (acceptance criteria in EARS)
- RF-1: WHEN the user taps "Guardar" and the working lineup has a linked game, THE SYSTEM SHALL replace that saved
  game's `state` with the working lineup and set its `at` to now, keeping its `id` and `name`, without asking for a
  name, change no other saved game, and show "Juego actualizado".
- RF-2: WHEN the user taps "Guardar" and the working lineup has no linked game, THE SYSTEM SHALL ask for a name as
  today, add a new saved game and make it the linked game.
- RF-3: THE SYSTEM SHALL offer "Guardar como nuevo" while the working lineup has a linked game; WHEN it is used,
  THE SYSTEM SHALL ask for a name and add a new saved game whose state keeps `team`, `opp`, `home`, the players of
  the game, positions, batting order, `dh` and the SF/4F/DH flags, with no `statsId`, `innings` 7, scoreboard all
  0 and today's local date; it SHALL load that state as the working lineup, make the new game the linked game, and
  leave the previous saved game and its stats unchanged.
- RF-4: WHEN the user opens a saved game ("Abrir"), THE SYSTEM SHALL load a copy of its `state` as the working
  lineup, normalized as today, and make it the linked game.
- RF-5: IF the user opens a saved game or taps "Nuevo" while there are unsaved changes, THEN THE SYSTEM SHALL ask
  to confirm ("Hay cambios sin guardar") before discarding them, and keep the working lineup if the user cancels.
- RF-6: WHEN stats are saved and the save updates the working lineup (the capture's stats link equals the working
  lineup's, from "Anotar estadísticas" or from Estadísticas → Juegos) and the working lineup has a linked game,
  THE SYSTEM SHALL also update that saved game with the whole working lineup as RF-1 does (lineup edits not yet
  saved go with it) and show "Estadísticas guardadas".
- RF-7: IF updating the linked saved game fails during RF-6, THEN THE SYSTEM SHALL restore the stats and the
  working lineup to their previous values, keep the capture sheet open and show "No se pudo guardar en este
  navegador".
- RF-8: WHEN the app starts, THE SYSTEM SHALL show an empty working lineup with no linked game (permanent roster
  kept, team name cleared), without writing it to this device's or the account's `current` until the user recovers,
  discards, or changes the lineup.
- RF-9: WHILE the working lineup is the untouched empty one of RF-8 and the stored working lineup (this device's or
  the account's, including one that arrives after start) has unsaved changes, THE SYSTEM SHALL offer "Recuperar lo
  último" showing its team, opponent and date (dd/mm/aaaa) with two buttons: "Recuperar" loads it with its linked
  game; "Descartar" asks to confirm and then drops it.
- RF-10: WHEN the user changes the empty working lineup while the RF-9 offer is shown, THE SYSTEM SHALL ask once
  "¿Descartar lo último sin guardar?" with "Descartar" (keep the new change, drop the old lineup) and "Recuperar"
  (load the old lineup, dropping the new change).
- RF-11: THE SYSTEM SHALL keep up to 200 saved games (today 60).
- RF-12: IF adding a saved game (RF-2, RF-3) would leave more than 200, THEN THE SYSTEM SHALL ask to confirm naming
  the least recently saved game(s) that will be deleted, and save nothing if the user cancels.
- RF-13: WHEN the user deletes the linked game from "Alineaciones guardadas", THE SYSTEM SHALL keep the working
  lineup on screen with no linked game (a later "Guardar" follows RF-2).
- RF-14: THE SYSTEM SHALL keep saved games, the working lineup and backups of earlier versions valid: an entry or a
  working lineup without the new fields opens as today, with no linked game.
- RF-15: THE SYSTEM SHALL show which saved game is open: its name on the main screen while it is linked, and a
  marker on its row in "Alineaciones guardadas".
- RF-16: IF the user taps "Guardar" on a linked game whose saved `at` differs from the one the link holds (it was
  saved on another device meanwhile), THEN THE SYSTEM SHALL say "Este juego cambió en otro dispositivo" and offer
  "Reemplazar" (RF-1), "Guardar como nuevo" (RF-3) or "Cancelar".
- RF-17: WHEN the list of saved games of this device is merged with the account's, THE SYSTEM SHALL keep every
  entry (no 60/200 cut) and, for an `id` present in both, the one with the newer `at`.

### Design (from the impeccable critique of 2026-11-05, 25/40; Kevin chose all four groups)
Refinement of the incumbent look (colors, fonts, field drawings stay); "phone" = 360–430 px wide, "desktop" ≥ 1024 px.

Open game and save loop
- RF-18: WHILE the working lineup has a linked game, THE SYSTEM SHALL show the game's name in the header on desktop
  (where "Softball · Lineups" is today) and on phone (a line under the brand), with a "●" marker and the accessible
  text "cambios sin guardar" while there are unsaved changes; with no linked game it SHALL show "Juego sin guardar"
  only when the working lineup is not empty. (Implements RF-15's main-screen part.)
- RF-19: THE SYSTEM SHALL show each row of the saved games list with its name, the final score and result ("Ganado
  6–5", "Perdido 3–4", "Empate 2–2"; nothing when both totals are 0), a "Estadísticas" pill when its state has a
  stats link, an "Abierto" pill on the linked game (RF-15's list part), and the save time as "29/10 · 7:32 p. m."
  (no seconds).
- RF-20: THE SYSTEM SHALL propose "<team> vs <opponent> · dd/mm/aaaa" as the name when saving a new game (today
  the date is ISO).
- RF-21: THE SYSTEM SHALL end RF-1 with the toast "Juego actualizado: «<name>»" and RF-2/RF-3 with "Juego guardado:
  «<name>»", and clear the RF-18 marker.

Header
- RF-22: THE SYSTEM SHALL show on desktop, in this order: "Nuevo", "Guardar" (the accent/key style), "Guardar como
  nuevo" (only while there is a linked game), "Abrir" (opens the saved games list, titled "Abrir juego"),
  "Estadísticas", a "Compartir" menu (Copiar imagen, Térmica, Imprimir / PDF) and a "Más" menu (Roster, Respaldo,
  Instalar when available, Cerrar sesión). No other header button keeps the key style.
- RF-23: THE SYSTEM SHALL make "Guardar" the key button of the phone header, move "Compartir" into a header icon
  button that opens the same share sheet, and keep the rest in the options sheet with the RF-22 labels.
- RF-24: THE SYSTEM SHALL use the same label for the same action on phone and desktop: "Abrir" / "Abrir juego",
  "Roster", "Respaldo", "Cerrar sesión".

One meaning of "Guardar" in stats
- RF-25: THE SYSTEM SHALL label the capture sheet's save button "Guardar estadísticas" and title the sheet
  "<team> vs <opponent> · dd/mm" (today "Estadísticas · <opponent>").
- RF-26: WHEN stats are saved, THE SYSTEM SHALL show "Estadísticas guardadas en «<name>»" if RF-6 updated a linked
  game, else "Estadísticas guardadas".

Plate-appearance picker and field
- RF-27: WHEN the result picker opens, THE SYSTEM SHALL show the result codes, "Anotó carrera" and the actions, with
  CI, BR and Outs inside a collapsed "Más detalles" section; the section SHALL start open when the PA being edited
  has CI, BR or outs different from the default, and open by itself when the user picks HR, SF or BO.
- RF-28: THE SYSTEM SHALL draw a chip that holds its default value outlined (not filled) and keep the filled style
  for the chosen result code and for values the user changed.
- RF-29: THE SYSTEM SHALL render the field cards' position key, jersey and name at 10 px or more on a 360 px wide
  phone.
- RF-30: IF two players on the field would show the same short name (e.g. "K. Perez"), THEN THE SYSTEM SHALL show
  both as first name + last-name initial ("Kevin P.", "Keven P."), and IF those still collide, the full name.

Small fixes found by the critique
- RF-31: WHEN the capture sheet opens, THE SYSTEM SHALL not put the focus in the date input (no keyboard pops on
  phone).
- RF-32: THE SYSTEM SHALL show the team names with "Visita" / "Casa" in the phone scoreboard.
- RF-33: THE SYSTEM SHALL show under the capture grid a one-line legend: "• anotó carrera · número pequeño: orden
  del turno · rojo: no cuadra con la pizarra · ⚠: outs del inning".
- RF-34: WHEN the user taps "Importar" in Respaldo, THE SYSTEM SHALL ask to confirm ("Se reemplaza todo lo de esta
  cuenta…") before replacing anything (constitution principle 5).

## Non-functional requirements
- Constitution applies: vanilla JS in `index.html` style; the "compared fields", "empty", "unsaved changes" and
  cap/merge logic are pure functions in `stats.js` (or a pure file listed in `sw.js`) with Node tests; no new
  dependency; `sw.js` `VERSION` bumped.
- User-facing text in Latin American Spanish.

## Edge cases
- The two existing "MSO vs Call · 2026-10-29" entries stay as they are; Kevin deletes the old one by hand.
- Saving a linked game with no changes still refreshes `at` (harmless).
- Deleting a saved game does not delete its stats (they stay under Estadísticas → Juegos, as today).
- A recovered lineup whose linked game no longer exists comes back with no linked game.
- Once the working lineup is not empty, a change to `current` from the other device replaces it, as today
  (the working lineup is shared live; only the start is empty).
- A device still on the old version cuts the list to 60 when it saves; it updates on its next launch. Only matters
  past 60 games.
- Backup import ("Importar") keeps today's behavior (replaces everything without RF-5); RF-17 does not apply to it.
- A saved game whose players left the permanent roster opens as today.

## Out of scope
- Renaming a saved game; sorting or searching the list (most recently saved first, as today).
- Merging the two existing duplicates automatically.
- Linking a stats record that has no working-lineup link to a saved game from Estadísticas → Juegos.
- Critique items not chosen: one merged "Juegos" list, an end-of-game card, keyboard shortcuts, opening the capture
  sheet in guided mode, the bench "—" badge semantics, the G/P/E wording in Estadísticas → Juegos, footer copy, a
  type-scale change (detector's flat-type-hierarchy), the field drawings themselves.

## Decisions
- Kevin, 2026-11-05: start empty with recovery; stats save updates the game; "Guardar como nuevo" copies only the
  lineup; limit 200 with a warning; the start does not touch the cloud copy; ask once before dropping the
  recoverable lineup; ask on a cross-device conflict.
- Kevin, 2026-11-05 (after the critique): all four design groups go into this spec (open game visible, header with
  Guardar first, one meaning of Guardar, picker + field); saving ends on a toast with the game's name.
- Orchestrator (confirm at G1): "Empty" ignores the players of the game, so a lineup with only attendance chosen is
  not offered for recovery; "Guardar como nuevo" is a header button (RF-22); the field card's big badge keeps the
  position number (the critique suggested the jersey; not chosen); "lo menor" was read as RF-31–RF-34 only.

## Done criteria
- Every RF has a green test where it is logic, and the main flow is demoed in the browser: build a lineup, save,
  reload (empty + recover offer), open the game, change a player, save (one entry), save stats (entry updated),
  "Guardar como nuevo" (two entries, old one and its stats intact), conflict prompt with two tabs.
- Design RFs checked by hand at 375 px and 1440 px; `impeccable detect` shows no slot-jersey/slot-key under 10 px;
  a re-run of the impeccable critique scores heuristics 1, 4, 5 and 6 at 3 or more.
- `node --test 'tests/*.test.js'` green.

## Open questions
- (none)
