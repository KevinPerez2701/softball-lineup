# Spec 003 — Saved lineups as games

Status: clarified (clarifier review 2026-11-05: 7 blocking + 9 minor, all resolved below; awaiting G1)
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
- Any design change to the screens (a separate spec after this one, with the impeccable audit).

## Decisions
- Kevin, 2026-11-05: start empty with recovery; stats save updates the game; "Guardar como nuevo" copies only the
  lineup; limit 200 with a warning; the start does not touch the cloud copy; ask once before dropping the
  recoverable lineup; ask on a cross-device conflict.
- Orchestrator (confirm at G1): "Empty" ignores the players of the game, so a lineup with only attendance chosen is
  not offered for recovery; "Guardar como nuevo" is a second button next to "Guardar" or a choice after it,
  whichever is the smaller change.

## Done criteria
- Every RF has a green test where it is logic, and the main flow is demoed in the browser: build a lineup, save,
  reload (empty + recover offer), open the game, change a player, save (one entry), save stats (entry updated),
  "Guardar como nuevo" (two entries, old one and its stats intact), conflict prompt with two tabs.
- `node --test 'tests/*.test.js'` green.

## Open questions
- (none)
